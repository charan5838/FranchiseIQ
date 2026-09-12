#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo "  FranchiseIQ - Render.com Build Process"
echo "=========================================="

echo ">> 1. Building React 19 Frontend..."
cd frontend
if command -v npm &> /dev/null; then
    npm install
    npm run build
else
    echo "Notice: npm not found, using prebuilt frontend distribution."
fi
cd ..

echo ">> 2. Installing Backend Dependencies..."
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt

echo ">> 3. Initializing Database & Seeding MongoDB/SQLite..."
python -c "from app.seed.seed_data import init_db, seed_all_data; init_db(); seed_all_data()"
cd ..

echo ">> 4. Build successfully completed!"

