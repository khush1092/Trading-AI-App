from dataclasses import dataclass
from functools import lru_cache
from os import getenv

from dotenv import load_dotenv

load_dotenv()

SUPPORTED_INTERVAL_CHOICES = {"1d", "1h"}


def _parse_csv(raw: str, fallback: list[str]) -> list[str]:
    values = [item.strip() for item in raw.split(",") if item.strip()]
    return values or fallback


@dataclass(frozen=True)
class Settings:
    app_env: str
    app_name: str
    app_host: str
    app_port: int
    database_url: str
    tracked_symbols: list[str]
    supported_intervals: list[str]
    scheduler_minutes: int
    api_retry_attempts: int
    api_retry_delay_seconds: float
    max_concurrent_fetches: int
    model_min_rows: int
    model_test_size: float
    signal_threshold: float
    model_random_state: int


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    tracked_symbols = _parse_csv(
        getenv(
            "TRACKED_SYMBOLS",
            "RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS,ICICIBANK.NS,SBIN.NS"
        ),
        ["RELIANCE.NS"]
    )
    intervals = [
        interval
        for interval in _parse_csv(getenv("SUPPORTED_INTERVALS", "1d,1h"), ["1d", "1h"])
        if interval in SUPPORTED_INTERVAL_CHOICES
    ]

    return Settings(
        app_env=getenv("APP_ENV", "development"),
        app_name=getenv("APP_NAME", "Indian Stock Market AI Service"),
        app_host=getenv("APP_HOST", "0.0.0.0"),
        app_port=int(getenv("APP_PORT", "8001")),
        database_url=getenv(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/indian_paper_trading"
        ),
        tracked_symbols=tracked_symbols,
        supported_intervals=intervals or ["1d", "1h"],
        scheduler_minutes=int(getenv("SCHEDULER_MINUTES", "5")),
        api_retry_attempts=max(1, int(getenv("API_RETRY_ATTEMPTS", "3"))),
        api_retry_delay_seconds=max(0.5, float(getenv("API_RETRY_DELAY_SECONDS", "2"))),
        max_concurrent_fetches=max(1, int(getenv("MAX_CONCURRENT_FETCHES", "4"))),
        model_min_rows=max(30, int(getenv("MODEL_MIN_ROWS", "60"))),
        model_test_size=min(0.4, max(0.1, float(getenv("MODEL_TEST_SIZE", "0.2")))),
        signal_threshold=max(0.001, float(getenv("SIGNAL_THRESHOLD", "0.004"))),
        model_random_state=int(getenv("MODEL_RANDOM_STATE", "42"))
    )
