from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.kafka.ensure_topic import ensure_topic_exists
from app.services.socket.socket_consumer import socket_consumer_loop
from app.services.kafka.influx_consumer import influx_consumer_loop
from app.routers import history,pipeline,simulations
from contextlib import asynccontextmanager
import asyncio
import socketio
from datetime import datetime

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])

API_V="/api/v1"

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.feature_crop = 'Maize'
    # same thing fore maize & Sorghum 
    app.state.planting_date = datetime(2025, 5, 10)
    
    app.state.prev_deficit_mm = 0
    app.state.pipeline_task = None

    await asyncio.to_thread(ensure_topic_exists)

    app.state.socket_task= asyncio.create_task(socket_consumer_loop(sio,app))  
    app.state.influx_task=asyncio.create_task(influx_consumer_loop())

    print("Consumers are live 🚀")

    yield

    print("Shutting down...🛑")
    tasks = [
        app.state.pipeline_task,
        app.state.socket_task,
        app.state.influx_task
    ]
    active = [t for t in tasks if t and not t.done()]

    for t in active:
        t.cancel()
    await asyncio.gather(*active, return_exceptions=True)
    print(f"{len(active)} consumers shut down")


app = FastAPI(lifespan=lifespan)

# including router 
app.include_router(history.router,prefix=API_V,tags=API_V)
app.include_router(pipeline.router,prefix=API_V,tags=API_V)
app.include_router(simulations.router,prefix=API_V,tags=API_V)


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




