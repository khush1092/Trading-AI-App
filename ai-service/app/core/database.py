from typing import Optional

import asyncpg
from asyncpg import Pool

from app.core.config import get_settings

_pool: Optional[Pool] = None


async def init_database() -> None:
    global _pool

    if _pool is None:
        settings = get_settings()
        _pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=1,
            max_size=10,
            command_timeout=60
        )


async def close_database() -> None:
    global _pool

    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> Pool:
    if _pool is None:
        raise RuntimeError("Database pool has not been initialized")

    return _pool


async def ping_database() -> bool:
    if _pool is None:
        return False

    try:
        async with _pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        return True
    except Exception:
        return False
