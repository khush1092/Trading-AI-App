from collections.abc import Sequence

from app.core.database import get_pool
from app.schemas.data import StockPriceRecord

UPSERT_STOCK_PRICE_SQL = """
INSERT INTO stock_prices (
    symbol,
    interval,
    price,
    open,
    high,
    low,
    close,
    volume,
    "timestamp"
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (symbol, interval, "timestamp")
DO UPDATE SET
    price = EXCLUDED.price,
    open = EXCLUDED.open,
    high = EXCLUDED.high,
    low = EXCLUDED.low,
    close = EXCLUDED.close,
    volume = EXCLUDED.volume
"""


async def upsert_stock_prices(rows: Sequence[StockPriceRecord]) -> int:
    if not rows:
        return 0

    values = [
        (
            row.symbol,
            row.interval,
            row.price,
            row.open,
            row.high,
            row.low,
            row.close,
            row.volume,
            row.timestamp
        )
        for row in rows
    ]

    pool = get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            await connection.executemany(UPSERT_STOCK_PRICE_SQL, values)

    return len(rows)
