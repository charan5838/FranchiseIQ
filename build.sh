#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo "  FranchiseIQ - Render.com Build Process"
echo "=========================================="

echo ">> 1. Building React 19 Frontend..."
cd frontend
npm install
npm run build
cd ..

echo ">> 2. Installing Backend Dependencies..."
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo ">> 3. Build successfully completed!"
