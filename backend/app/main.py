from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import PROJECT_NAME, API_V1_STR
from app.database import engine, Base
from app.seed.seed_data import init_db, seed_all_data
from app.routers import (
    auth_router,
    franchises_router,
    recommendation_router,
    calculator_router,
    comparison_router,
    location_router,
    watchlist_router,
    reviews_router,
    admin_router
)

# Initialize FastAPI App
app = FastAPI(
    title=PROJECT_NAME,
    description="FranchiseIQ: Financial Intelligence and Decision-Support Platform for Franchise Investors",
    version="2.0.0"
)

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Ensure database schema is created and populated with demo data
    init_db()
    seed_all_data()

# Mount API Routers
app.include_router(auth_router, prefix=API_V1_STR)
app.include_router(franchises_router, prefix=API_V1_STR)
app.include_router(recommendation_router, prefix=API_V1_STR)
app.include_router(calculator_router, prefix=API_V1_STR)
app.include_router(comparison_router, prefix=API_V1_STR)
app.include_router(location_router, prefix=API_V1_STR)
app.include_router(watchlist_router, prefix=API_V1_STR)
app.include_router(reviews_router, prefix=API_V1_STR)
app.include_router(admin_router, prefix=API_V1_STR)

@app.get("/")
def root():
    return {
        "app": PROJECT_NAME,
        "tagline": "Invest in the right franchise, not just the right brand.",
        "status": "online",
        "docs_url": "/docs",
        "demo_accounts": {
            "investor": {"email": "investor@franchiseiq.com", "password": "Investor@123"},
            "admin": {"email": "admin@franchiseiq.com", "password": "Admin@123"}
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "FranchiseIQ API"}
