import asyncio
from datetime import UTC, datetime

from app.core.config import get_settings
from app.core.logging import get_logger
from app.repositories.stock_prices_repository import upsert_stock_prices
from app.schemas.data import IntervalType, SyncItemResult, SyncResponse
from app.services.yfinance_service import fetch_stock_history

logger = get_logger(__name__)


def _normalize_symbols(symbols: list[str] | None) -> list[str]:
    settings = get_settings()
    resolved = symbols or settings.tracked_symbols
    return [symbol.strip().upper() for symbol in resolved if symbol.strip()]


def _normalize_intervals(intervals: list[IntervalType] | None) -> list[IntervalType]:
    settings = get_settings()
    resolved = intervals or settings.supported_intervals
    return [interval for interval in resolved if interval in {"1d", "1h"}]


async def _sync_one_job(
    semaphore: asyncio.Semaphore,
    symbol: str,
    interval: IntervalType,
    period_override: str | None
) -> SyncItemResult:
    async with semaphore:
        try:
            fetch_result = await fetch_stock_history(
                symbol=symbol,
                interval=interval,
                period_override=period_override
            )

            if not fetch_result.records:
                logger.info("No data returned | symbol=%s interval=%s", symbol, interval)
                return SyncItemResult(
                    symbol=symbol,
                    interval=interval,
                    fetched_rows=0,
                    stored_rows=0,
                    skipped_rows=fetch_result.skipped_rows,
                    status="empty",
                    message="No rows returned from yfinance"
                )

            stored_rows = await upsert_stock_prices(fetch_result.records)
            logger.info(
                "Upsert complete | symbol=%s interval=%s stored_rows=%s skipped_rows=%s",
                symbol,
                interval,
                stored_rows,
                fetch_result.skipped_rows
            )
            return SyncItemResult(
                symbol=symbol,
                interval=interval,
                fetched_rows=len(fetch_result.records),
                stored_rows=stored_rows,
                skipped_rows=fetch_result.skipped_rows,
                status="success"
            )
        except Exception as exc:
            logger.exception("Stock sync failed | symbol=%s interval=%s", symbol, interval)
            return SyncItemResult(
                symbol=symbol,
                interval=interval,
                fetched_rows=0,
                stored_rows=0,
                skipped_rows=0,
                status="failed",
                message=str(exc)
            )


async def sync_stock_prices(
    symbols: list[str] | None = None,
    intervals: list[IntervalType] | None = None,
    period_override: str | None = None,
    trigger: str = "manual"
) -> SyncResponse:
    settings = get_settings()
    started_at = datetime.now(UTC)
    normalized_symbols = _normalize_symbols(symbols)
    normalized_intervals = _normalize_intervals(intervals)
    semaphore = asyncio.Semaphore(settings.max_concurrent_fetches)

    tasks = [
        _sync_one_job(semaphore, symbol, interval, period_override)
        for symbol in normalized_symbols
        for interval in normalized_intervals
    ]
    results = await asyncio.gather(*tasks)
    finished_at = datetime.now(UTC)

    successful_jobs = sum(1 for item in results if item.status == "success")
    failed_jobs = sum(1 for item in results if item.status == "failed")

    return SyncResponse(
        trigger=trigger,
        started_at=started_at,
        finished_at=finished_at,
        total_jobs=len(results),
        successful_jobs=successful_jobs,
        failed_jobs=failed_jobs,
        results=results
    )
