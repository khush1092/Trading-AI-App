import pandas as pd

from app.core.database import get_pool
from app.schemas.data import IntervalType


async def fetch_historical_stock_prices(symbol: str, interval: IntervalType) -> pd.DataFrame:
    pool = get_pool()
    normalized_symbol = symbol.strip().upper()

    async with pool.acquire() as connection:
        rows = await connection.fetch(
            """
            SELECT
                symbol,
                interval,
                price,
                open,
                high,
                low,
                close,
                volume,
                "timestamp"
            FROM stock_prices
            WHERE symbol = $1 AND interval = $2
            ORDER BY "timestamp" ASC
            """,
            normalized_symbol,
            interval
        )

    if not rows:
        return pd.DataFrame(
            columns=["symbol", "interval", "price", "open", "high", "low", "close", "volume", "timestamp"]
        )

    frame = pd.DataFrame([dict(row) for row in rows])
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True)

    for column in ["price", "open", "high", "low", "close", "volume"]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")

    return frame
