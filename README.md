# FranchiseIQ — Financial Intelligence & Decision-Support Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)

> **"Invest in the right franchise, not just the right brand."**  
> *Compare. Analyze. Predict. Invest smarter.*

---

## Overview

**FranchiseIQ** is an independent decision-support and financial intelligence platform designed to answer the core investor question:

> **“Given my budget, location, space, preferred sector and risk tolerance, which franchise is financially most suitable for me, and why?”**

Unlike simple franchise listing directories, FranchiseIQ provides forensic unit economics validation, personalized multi-factor scoring, 4-tier data verification provenance, claimed-vs-actual gap detection, trade catchment location intelligence, and 5-year historical trend tracking.

---

## Key Features

### 1. Investor Decision Suite
* **Personalized Scoring Engine (`/advisor`):** Ranks opportunities from 0–100 using investor constraints (Budget, City, Locality, Sector, Space Area, Business Experience, Involvement, Risk Tolerance, Desired ROI, Max Payback) and strategic goals (*Maximum ROI*, *Lowest Risk*, *Fastest Payback*, *Lowest Investment*, *Highest Profit*, *Highest Growth*, *Best Overall*).
* **Explainable "Why Ranked" Analysis:** Transparently presents both specific financial drivers (budget cushion, rapid payback, low royalties, prime location match) AND operational risks (rent sensitivity, ingredient inflation, churn).
* **4-Tier Data Verification System:**
  * 🟢 **VERIFIED:** Official, audited corporate disclosures.
  * 🔵 **REPORTED:** Survey submissions from verified active franchisees.
  * 🟡 **ESTIMATED:** Platform algorithmic unit economics modeling.
  * 🔴 **MARKETING CLAIM:** Direct promotional figures advertised by the franchisor.
* **Actual vs. Claimed Profit Gap Audit:** Computes discrepancies between advertised claims and real-world operational P&Ls, highlighting suspiciously large gaps (>20%).
* **Interactive Financial Calculator & Break-Even Curve (`/calculator`):** Real-time modeling of footfall, average ticket value, rental drag, staff payroll, utilities, and variable royalties with interactive SVG break-even curves.
* **Macro Shock Scenario Simulator (`/simulator`):** Stress-tests franchises against economic downturns (sales -20%, rent +15%, labor +10%, supply costs +12%) with Unit Fragility ratings (*Resilient*, *Moderate Impact*, *High Fragility*).
* **Location Intelligence & Competitor Radar (`/location`):** Catchment viability scores (Demand, Competition, Rent Efficiency, Footfall, Saturation) and competitor radar mapping distance, density, and competitive intensity.
* **Side-by-Side Comparison (`/compare`):** Direct 2–5 franchise comparison across 14 financial and operational metrics with best-in-class highlights.
* **Watchlist & Capital Movement Tracking (`/watchlist`):** Monitors investment drift and ROI changes over time with automated alert notifications.

### 2. Admin Governance Suite (`/admin`)
* Full CRUD for franchise profiles and unit economics.
* Verification audit management: update certification levels, methodologies, and confidence scores.
* Dynamic sector management across 30+ categories.
* Document ingestion and simulated AI clause parsing for Franchise Disclosure Documents (FDDs) and P&Ls.
* Immutable regulatory audit trail logging all data modifications.

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Vite.
* **Backend:** Python 3.13, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL parity.
* **Authentication:** Cryptographic PBKDF2 hashing, HS256 JWT tokens, role-based access control.
* **Analytics Layer:** Modular Python financial modeling, risk engine, and forecasting algorithms.

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m app.seed.seed_data
python run.py
```
Backend API will be live at `http://127.0.0.1:8000`  
Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will be live at `http://127.0.0.1:5173`

---

## Demo Accounts
The application includes 1-click login buttons in the navigation bar:
* **Demo Investor:** `investor@franchiseiq.com` / `Investor@123`
* **Demo Admin:** `admin@franchiseiq.com` / `Admin@123`

---

## Deploying on Render (Render.com)

FranchiseIQ is pre-configured for **1-click or automated deployment on Render** using Render Blueprints (`render.yaml`).

### Method 1: Render Blueprints (Automatic)
1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Connect your GitHub repository: `https://github.com/charan5838/FranchiseIQ`.
4. Render will detect `render.yaml` automatically and configure the unified Web Service!
5. Click **Apply** to deploy.

### Method 2: Manual Web Service Setup on Render
If creating a Web Service manually:
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect `https://github.com/charan5838/FranchiseIQ`.
3. Configure settings:
   * **Name:** `franchiseiq`
   * **Region:** Any (e.g. Oregon or Singapore)
   * **Branch:** `main`
   * **Root Directory:** *(leave blank)*
   * **Runtime:** `Python 3`
   * **Build Command:** `./build.sh`
   * **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Plan:** Free
4. Click **Create Web Service**.

Both the React 19 frontend and FastAPI backend will run together under one unified URL (e.g., `https://franchiseiq.onrender.com`), with `/api` and `/docs` accessible directly.

---

## Disclaimer
*Estimated monthly profit based on available data. Actual results may vary based on location, execution, expenses and market conditions. Never treat projections as guaranteed return commitments.*

