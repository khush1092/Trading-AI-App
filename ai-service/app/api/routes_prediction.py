from fastapi import APIRouter, HTTPException, Query

from app.schemas.data import IntervalType
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import PredictionServiceError, predict_signal_for_symbol

router = APIRouter(tags=["prediction"])


@router.get("/prediction/{symbol}", response_model=PredictionResponse)
async def get_prediction(
    symbol: str,
    interval: IntervalType = Query(default="1d")
) -> PredictionResponse:
    try:
        return await predict_signal_for_symbol(symbol=symbol, interval=interval)
    except PredictionServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
