from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.kafka.producer import run_producer
from app.services.kafka.ensure_topic import ensure_topic_exists
from app.services.socket.socket_consumer import socket_consumer_loop
from asyncio import create_task
from contextlib import asynccontextmanager
import asyncio
import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pipeline_task = None

    await asyncio.to_thread(ensure_topic_exists)

    app.state.socket_task= asyncio.create_task(socket_consumer_loop(sio))  

    print("Consumers are live 🚀")

    yield

    print("Shutting down...🛑")
    tasks = [
        app.state.pipeline_task,
        app.state.socket_task,
    ]
    active = [t for t in tasks if t and not t.done()]

    for t in active:
        t.cancel()
    await asyncio.gather(*active, return_exceptions=True)
    print(f"{len(active)} consumers shut down")


app = FastAPI(lifespan=lifespan)

socket_app = socketio.ASGIApp(
    socketio_server=sio,
    socketio_path=""
)

origins = [
    "http://localhost:3000",
    "http://localhost:4000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/ws",socket_app)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@app.get("/")
def get_home():
    return {"status":"ok","data":"you get the data successfully"}

@app.get("/python")
def get_python():
    return {"status":"ok","fetched":True,"aiModel":"Gemini Pro 3.5"}

@app.get("/api/v1/pipeline/start")
async def turn_on_pipeline():
    task: asyncio.Task | None = app.state.pipeline_task

    if task and not task.done():
        return {"ok": False, "status": "warning", "message": "Producer already running"}

    if task and task.done():
        if task.cancelled():
            print("ℹ️ Previous pipeline was stopped intentionally by the user.")
        else:
            exc = task.exception()
            if exc:
                print(f"Previous pipeline crashed: {exc}")
            else:
                print("Previous pipeline finished its work successfully.")

    app.state.pipeline_task = create_task(run_producer())
    return {"ok": True, "message": "Pipeline started"}


@app.get("/api/v1/pipeline/stop")
async def stop_pipeline():
    task: asyncio.Task | None = app.state.pipeline_task

    if not task or task.done():
        return {"ok": False, "message": "Pipeline is not running"}

    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass

    app.state.pipeline_task = None
    return {"ok": True, "message": "Pipeline stopped"}


@app.get("/api/v1/pipeline/status")
async def get_pipeline_status():

    task = app.state.pipeline_task
    
    is_running = task is not None and not task.done()
    
    return {
        "is_running": is_running,
        "status_code": "ACTIVE" if is_running else "IDLE"
    }