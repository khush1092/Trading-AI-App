from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

IntervalType = Literal["1d", "1h"]


class ManualSyncRequest(BaseModel):
    symbols: list[str] | None = Field(default=None, description="NSE symbols like RELIANCE.NS")
    intervals: list[IntervalType] | None = Field(default=None, description="Supported intervals")
    period_override: str | None = Field(
        default=None,
        description="Optional yfinance period such as 5d or 1mo"
    )

    @field_validator("symbols")
    @classmethod
    def normalize_symbols(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return value

        return [item.strip().upper() for item in value if item.strip()]


class StockPriceRecord(BaseModel):
    symbol: str
    interval: IntervalType
    price: float
    open: float | None
    high: float | None
    low: float | None
    close: float | None
    volume: int | None
    timestamp: datetime


class SyncItemResult(BaseModel):
    symbol: str
    interval: IntervalType
    fetched_rows: int
    stored_rows: int
    skipped_rows: int
    status: Literal["success", "empty", "failed"]
    message: str | None = None


class SyncResponse(BaseModel):
    trigger: Literal["manual", "scheduler"]
    started_at: datetime
    finished_at: datetime
    total_jobs: int
    successful_jobs: int
    failed_jobs: int
    results: list[SyncItemResult]
