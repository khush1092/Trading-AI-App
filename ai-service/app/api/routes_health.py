from fastapi import APIRouter

from app.core.database import ping_database

router = APIRouter(tags=["health"])


@router.get("/internal/v1/health")
async def health_check():
    database_ok = await ping_database()

    return {
        "status": "ok" if database_ok else "degraded",
        "service": "ai-service",
        "database": "connected" if database_ok else "unreachable"
    }
