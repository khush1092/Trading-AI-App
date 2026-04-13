from dataclasses import dataclass

import pandas as pd

from app.core.config import get_settings


@dataclass(frozen=True)
class PreparedDataset:
    labeled_frame: pd.DataFrame
    latest_feature_frame: pd.DataFrame
    feature_columns: list[str]
    latest_close: float


def _compute_rsi(series: pd.Series, window: int = 14) -> pd.Series:
    delta = series.diff()
    gains = delta.clip(lower=0)
    losses = -delta.clip(upper=0)
    average_gain = gains.ewm(alpha=1 / window, adjust=False, min_periods=window).mean()
    average_loss = losses.ewm(alpha=1 / window, adjust=False, min_periods=window).mean()
    relative_strength = average_gain / average_loss.replace(0, pd.NA)
    rsi = 100 - (100 / (1 + relative_strength))
    return rsi.fillna(50)


def _build_target(next_return: float | None, threshold: float) -> str | None:
    if next_return is None or pd.isna(next_return):
        return None
    if next_return > threshold:
        return "BUY"
    if next_return < -threshold:
        return "SELL"
    return "HOLD"


def prepare_prediction_dataset(frame: pd.DataFrame) -> PreparedDataset:
    settings = get_settings()

    working = frame.copy()
    working = working.sort_values("timestamp").drop_duplicates(subset=["timestamp"], keep="last")
    working["close"] = working["close"].fillna(working["price"])
    working["price"] = working["price"].fillna(working["close"])
    working["open"] = working["open"].fillna(working["close"])
    working["high"] = working["high"].fillna(
        working[["open", "close", "price"]].max(axis=1, numeric_only=True)
    )
    working["low"] = working["low"].fillna(
        working[["open", "close", "price"]].min(axis=1, numeric_only=True)
    )
    working["volume"] = working["volume"].fillna(0)
    working = working[working["close"].notna()].reset_index(drop=True)

    close = working["close"]
    volume = working["volume"]

    working["ma_5"] = close.rolling(window=5, min_periods=5).mean()
    working["ma_10"] = close.rolling(window=10, min_periods=10).mean()
    working["ma_20"] = close.rolling(window=20, min_periods=20).mean()
    working["ma_gap_5"] = (close - working["ma_5"]) / working["ma_5"]
    working["ma_gap_10"] = (close - working["ma_10"]) / working["ma_10"]
    working["ma_gap_20"] = (close - working["ma_20"]) / working["ma_20"]
    working["rsi_14"] = _compute_rsi(close, window=14)
    working["return_1"] = close.pct_change()
    working["return_3"] = close.pct_change(periods=3)
    working["range_pct"] = (working["high"] - working["low"]) / working["close"]
    working["volume_ma_5"] = volume.rolling(window=5, min_periods=5).mean()
    working["volume_ma_10"] = volume.rolling(window=10, min_periods=10).mean()
    working["volume_ratio_5"] = volume / working["volume_ma_5"].replace(0, pd.NA)
    working["volume_ratio_10"] = volume / working["volume_ma_10"].replace(0, pd.NA)
    working["volume_trend"] = volume.pct_change()
    working["next_return"] = close.shift(-1) / close - 1
    working["target"] = working["next_return"].apply(
        lambda value: _build_target(value, settings.signal_threshold)
    )

    feature_columns = [
        "close",
        "ma_5",
        "ma_10",
        "ma_20",
        "ma_gap_5",
        "ma_gap_10",
        "ma_gap_20",
        "rsi_14",
        "return_1",
        "return_3",
        "range_pct",
        "volume",
        "volume_ma_5",
        "volume_ma_10",
        "volume_ratio_5",
        "volume_ratio_10",
        "volume_trend"
    ]

    working = working.replace([float("inf"), float("-inf")], pd.NA)
    latest_row = working.iloc[[-1]].copy()
    labeled_frame = working[working["target"].notna()].copy()

    return PreparedDataset(
        labeled_frame=labeled_frame,
        latest_feature_frame=latest_row[feature_columns],
        feature_columns=feature_columns,
        latest_close=float(latest_row.iloc[0]["close"])
    )
