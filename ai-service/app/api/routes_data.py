from fastapi import APIRouter

from app.schemas.data import ManualSyncRequest, SyncResponse
from app.services.stock_ingestion_service import sync_stock_prices

router = APIRouter(prefix="/internal/v1/data", tags=["data"])


@router.post("/sync", response_model=SyncResponse)
async def manual_sync(payload: ManualSyncRequest) -> SyncResponse:
    return await sync_stock_prices(
        symbols=payload.symbols,
        intervals=payload.intervals,
        period_override=payload.period_override,
        trigger="manual"
    )
