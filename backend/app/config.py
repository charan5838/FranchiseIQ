import os

SECRET_KEY = os.getenv("SECRET_KEY", "franchiseiq-super-secure-jwt-secret-key-2026-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./franchiseiq.db")
PROJECT_NAME = "FranchiseIQ"
API_V1_STR = "/api"
