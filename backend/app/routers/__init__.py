from app.routers.auth import router as auth_router
from app.routers.franchises import router as franchises_router
from app.routers.recommendation import router as recommendation_router
from app.routers.calculator import router as calculator_router
from app.routers.comparison import router as comparison_router
from app.routers.location import router as location_router
from app.routers.watchlist import router as watchlist_router
from app.routers.reviews import router as reviews_router
from app.routers.admin import router as admin_router
from app.routers.sources import router as sources_router

__all__ = [
    "auth_router", "franchises_router", "recommendation_router",
    "calculator_router", "comparison_router", "location_router",
    "watchlist_router", "reviews_router", "admin_router", "sources_router"
]
