from fastapi import APIRouter,Request
import asyncio
from asyncio import create_task
from app.services.kafka.producer import run_producer

router = APIRouter(prefix="/pipeline",tags=["pipeline"])

@router.get("/start")
async def turn_on_pipeline(request:Request):
    task: asyncio.Task | None = request.app.state.pipeline_task

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

    request.app.state.pipeline_task = create_task(run_producer())
    return {"ok": True, "message": "Pipeline started"}


@router.get("/stop")
async def stop_pipeline(request:Request):
    task: asyncio.Task | None = request.app.state.pipeline_task

    if not task or task.done():
        return {"ok": False, "message": "Pipeline is not running"}

    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass

    request.app.state.pipeline_task = None
    return {"ok": True, "message": "Pipeline stopped"}


@router.get("/status")
async def get_pipeline_status(request:Request):

    task = request.app.state.pipeline_task
    
    is_running = task is not None and not task.done()
    
    return {
        "is_running": is_running,
        "status_code": "ACTIVE" if is_running else "IDLE"
    }
