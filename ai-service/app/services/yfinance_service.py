import asyncio
import math
from dataclasses import dataclass
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

import pandas as pd
import yfinance as yf

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.data import IntervalType, StockPriceRecord

logger = get_logger(__name__)
MARKET_TIMEZONE = ZoneInfo("Asia/Kolkata")
DEFAULT_PERIOD_BY_INTERVAL: dict[IntervalType, str] = {
    "1d": "1mo",
    "1h": "7d"
}


@dataclass
class FetchResult:
    records: list[StockPriceRecord]
    skipped_rows: int


def _safe_float(value: object) -> float | None:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)

    try:
        converted = float(value)
        if math.isnan(converted):
            return None
        return converted
    except (TypeError, ValueError):
        return None


def _safe_int(value: object) -> int | None:
    numeric = _safe_float(value)
    return None if numeric is None else int(numeric)


def _normalize_timestamp(timestamp_value: object) -> datetime:
    timestamp = pd.Timestamp(timestamp_value).to_pydatetime()

    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=MARKET_TIMEZONE)

    return timestamp.astimezone(UTC)


def _sanitize_ohlc(
    open_value: float | None,
    high_value: float | None,
    low_value: float | None,
    close_value: float | None,
    fallback_price: float
) -> tuple[float, float, float, float]:
    normalized_close = close_value if close_value is not None else fallback_price
    normalized_open = open_value if open_value is not None else normalized_close
    normalized_high = high_value if high_value is not None else max(normalized_open, normalized_close)
    normalized_low = low_value if low_value is not None else min(normalized_open, normalized_close)

    normalized_high = max(normalized_high, normalized_open, normalized_close)
    normalized_low = min(normalized_low, normalized_open, normalized_close)

    return (
        round(normalized_open, 4),
        round(normalized_high, 4),
        round(normalized_low, 4),
        round(normalized_close, 4)
    )


def _download_history(symbol: str, interval: IntervalType, period: str) -> pd.DataFrame:
    return yf.download(
        tickers=symbol,
        period=period,
        interval=interval,
        progress=False,
        auto_adjust=False,
        actions=False,
        threads=False
    )


def _build_records(symbol: str, interval: IntervalType, frame: pd.DataFrame) -> FetchResult:
    if frame.empty:
        return FetchResult(records=[], skipped_rows=0)

    records: list[StockPriceRecord] = []
    skipped_rows = 0

    for timestamp, row in frame.iterrows():
        open_value = _safe_float(row.get("Open"))
        high_value = _safe_float(row.get("High"))
        low_value = _safe_float(row.get("Low"))
        close_value = _safe_float(row.get("Close"))
        volume_value = _safe_int(row.get("Volume"))

        price = close_value if close_value is not None else open_value
        if price is None:
            skipped_rows += 1
            logger.warning(
                "Skipping %s %s row due to missing price data at %s",
                symbol,
                interval,
                timestamp
            )
            continue

        normalized_open, normalized_high, normalized_low, normalized_close = _sanitize_ohlc(
            open_value=open_value,
            high_value=high_value,
            low_value=low_value,
            close_value=close_value,
            fallback_price=price
        )

        records.append(
            StockPriceRecord(
                symbol=symbol.upper(),
                interval=interval,
                price=round(price, 4),
                open=normalized_open,
                high=normalized_high,
                low=normalized_low,
                close=normalized_close,
                volume=volume_value,
                timestamp=_normalize_timestamp(timestamp)
            )
        )

    return FetchResult(records=records, skipped_rows=skipped_rows)


async def fetch_stock_history(
    symbol: str,
    interval: IntervalType,
    period_override: str | None = None
) -> FetchResult:
    settings = get_settings()
    period = period_override or DEFAULT_PERIOD_BY_INTERVAL[interval]
    last_error: Exception | None = None

    for attempt in range(1, settings.api_retry_attempts + 1):
        try:
            logger.info(
                "Fetching stock data | symbol=%s interval=%s period=%s attempt=%s",
                symbol,
                interval,
                period,
                attempt
            )
            frame = await asyncio.to_thread(_download_history, symbol, interval, period)
            result = _build_records(symbol, interval, frame)
            logger.info(
                "Fetched stock data | symbol=%s interval=%s rows=%s skipped=%s",
                symbol,
                interval,
                len(result.records),
                result.skipped_rows
            )
            return result
        except Exception as exc:
            last_error = exc
            logger.warning(
                "Fetch attempt failed | symbol=%s interval=%s attempt=%s error=%s",
                symbol,
                interval,
                attempt,
                exc
            )
            if attempt < settings.api_retry_attempts:
                await asyncio.sleep(settings.api_retry_delay_seconds * attempt)

    assert last_error is not None
    raise last_error
