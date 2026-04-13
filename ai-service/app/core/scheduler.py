from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.stock_ingestion_service import sync_stock_prices

logger = get_logger(__name__)
_scheduler: AsyncIOScheduler | None = None


async def _scheduled_sync_job() -> None:
    try:
        result = await sync_stock_prices(trigger="scheduler")
        logger.info(
            "Scheduled stock sync completed | total_jobs=%s successful_jobs=%s failed_jobs=%s",
            result.total_jobs,
            result.successful_jobs,
            result.failed_jobs
        )
    except Exception:
        logger.exception("Scheduled stock sync failed")


def start_scheduler() -> None:
    global _scheduler

    if _scheduler and _scheduler.running:
        return

    settings = get_settings()
    _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
    _scheduler.add_job(
        _scheduled_sync_job,
        trigger=IntervalTrigger(minutes=settings.scheduler_minutes),
        id="stock-price-sync",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
        misfire_grace_time=120
    )
    _scheduler.start()
    logger.info("Scheduler started with %s-minute interval", settings.scheduler_minutes)


def shutdown_scheduler() -> None:
    global _scheduler

    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
