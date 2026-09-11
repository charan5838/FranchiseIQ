import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    admin_router,
    sources_router
)
from app.services.data_ingestion.scheduler import scheduler

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
    # Start background 24-hour official website refresh scheduler
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.stop()

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
app.include_router(sources_router, prefix=API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "FranchiseIQ API"}

@app.get("/api/info")
def api_info():
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

# Locate compiled React frontend distribution for unified production deployment (Render.com)
possible_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "dist")),
]
frontend_dist = next((d for d in possible_dist_dirs if os.path.exists(d)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes or Swagger docs
        if full_path.startswith("api/") or full_path in ("api", "docs", "redoc", "openapi.json", "health"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root_api():
        return api_info()
