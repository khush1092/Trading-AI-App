from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.data import IntervalType

PredictionSignal = Literal["BUY", "SELL", "HOLD"]


class EvaluationMetrics(BaseModel):
    accuracy: float
    training_samples: int
    test_samples: int


class PredictionResponse(BaseModel):
    symbol: str
    interval: IntervalType
    signal: PredictionSignal
    confidence: float
    latest_close: float
    generated_at: datetime
    evaluation: EvaluationMetrics
    probabilities: dict[PredictionSignal, float]
    features_used: list[str]
    model_name: str
