from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes_data import router as data_router
from app.api.routes_health import router as health_router
from app.api.routes_prediction import router as prediction_router
from app.core.config import get_settings
from app.core.database import close_database, init_database
from app.core.logging import configure_logging, get_logger
from app.core.scheduler import shutdown_scheduler, start_scheduler

configure_logging()
logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting %s", settings.app_name)
    await init_database()
    start_scheduler()
    yield
    shutdown_scheduler()
    await close_database()
    logger.info("Stopped %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(health_router)
app.include_router(data_router)
app.include_router(prediction_router)
