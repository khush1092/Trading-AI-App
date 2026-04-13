from dataclasses import dataclass
from datetime import UTC, datetime

from app.models.baseline_model import MODEL_NAME
from app.repositories.market_data_repository import fetch_historical_stock_prices
from app.schemas.data import IntervalType
from app.schemas.prediction import EvaluationMetrics, PredictionResponse
from app.services.feature_engineering_service import prepare_prediction_dataset
from app.services.model_training_service import train_baseline_model


@dataclass(frozen=True)
class PredictionServiceError(Exception):
    status_code: int
    message: str


async def predict_signal_for_symbol(symbol: str, interval: IntervalType) -> PredictionResponse:
    normalized_symbol = symbol.strip().upper()
    history = await fetch_historical_stock_prices(normalized_symbol, interval)

    if history.empty:
        raise PredictionServiceError(
            status_code=404,
            message=f"No historical stock data found for {normalized_symbol} ({interval})."
        )

    dataset = prepare_prediction_dataset(history)

    if dataset.labeled_frame.empty:
        raise PredictionServiceError(
            status_code=422,
            message=f"Not enough usable rows to build features for {normalized_symbol}."
        )

    try:
        trained_model = train_baseline_model(dataset)
    except ValueError as exc:
        raise PredictionServiceError(status_code=422, message=str(exc)) from exc

    predicted_signal = trained_model.pipeline.predict(dataset.latest_feature_frame)[0]
    predicted_probabilities = trained_model.pipeline.predict_proba(dataset.latest_feature_frame)[0]
    class_labels = trained_model.pipeline.named_steps["model"].classes_
    probability_map = {"BUY": 0.0, "SELL": 0.0, "HOLD": 0.0}

    for index, label in enumerate(class_labels):
        probability_map[str(label)] = float(predicted_probabilities[index])

    return PredictionResponse(
        symbol=normalized_symbol,
        interval=interval,
        signal=str(predicted_signal),
        confidence=round(max(probability_map.values()), 4),
        latest_close=round(dataset.latest_close, 4),
        generated_at=datetime.now(UTC),
        evaluation=EvaluationMetrics(
            accuracy=round(trained_model.accuracy, 4),
            training_samples=trained_model.training_samples,
            test_samples=trained_model.test_samples
        ),
        probabilities={
            "BUY": round(probability_map["BUY"], 4),
            "SELL": round(probability_map["SELL"], 4),
            "HOLD": round(probability_map["HOLD"], 4)
        },
        features_used=trained_model.feature_columns,
        model_name=MODEL_NAME
    )
