import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
from app.routers.auth import get_current_user
from app.services.risk_engine import calculate_risk_score

router = APIRouter(tags=["Watchlist & Alerts"])

@router.get("/watchlist")
def get_user_watchlist(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    items = list(db["watchlists"].find({"user_id": current_user.id}))
    results = []

    for w in items:
        f_raw = db["franchises"].find_one({"id": w.get("franchise_id")})
        if not f_raw:
            continue
        f = wrap_mongo_doc(clean_mongo_doc(f_raw))

        inv = f.investment
        fin = f.financial
        outlets = f.outlet_info
        fees = f.fees

        current_inv = inv.total_estimated_investment if inv else 2500000.0
        current_roi = fin.roi_annual if fin else 25.0

        confidence = 85.0
        if f.data_sources:
            confidence = sum(ds.confidence_level for ds in f.data_sources) / len(f.data_sources)

        risk = calculate_risk_score(
            total_investment=current_inv,
            royalty_pct=fees.royalty_percentage if fees else 5.0,
            closure_rate_pct=outlets.closure_rate_pct if outlets else 2.5,
            brand_age_years=f.brand_age_years or 5,
            expansion_rate_pct=f.expansion_rate or 15.0,
            data_confidence_score=confidence
        )

        added_inv = w.get("added_investment") or current_inv
        added_roi = w.get("added_roi") or current_roi
        inv_delta = current_inv - added_inv
        roi_delta = current_roi - added_roi

        sec_name = f.sector.name if (f.sector and hasattr(f.sector, 'name')) else "General"
        w_created = w.get("created_at")
        added_date_str = w_created.strftime("%b %d, %Y") if hasattr(w_created, "strftime") else "Sep 2026"

        results.append({
            "watchlist_id": w["id"],
            "franchise_id": f.id,
            "name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector": sec_name,
            "added_date": added_date_str,
            "added_investment": added_inv,
            "current_investment": current_inv,
            "investment_delta": inv_delta,
            "added_roi": added_roi,
            "current_roi": current_roi,
            "roi_delta": round(roi_delta, 1),
            "added_risk": w.get("added_risk", "Medium Risk"),
            "current_risk": risk["risk_tier"],
            "risk_score": risk["risk_score"],
            "payback_months": fin.payback_months if fin else 24.0,
            "monthly_profit": fin.actual_monthly_profit if fin else 75000.0
        })

    return results

@router.post("/watchlist/{franchise_id}")
def toggle_watchlist(
    franchise_id: int,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    existing = db["watchlists"].find_one({
        "user_id": current_user.id,
        "franchise_id": franchise_id
    })

    if existing:
        db["watchlists"].delete_one({"id": existing["id"]})
        return {"status": "removed", "franchise_id": franchise_id}

    f_raw = db["franchises"].find_one({"id": franchise_id})
    if not f_raw:
        raise HTTPException(status_code=404, detail="Franchise not found")
    f = wrap_mongo_doc(clean_mongo_doc(f_raw))

    inv = f.investment
    fin = f.financial
    total_inv = inv.total_estimated_investment if inv else 2500000.0
    roi = fin.roi_annual if fin else 25.0

    last_w = db["watchlists"].find_one(sort=[("id", -1)])
    next_w_id = (last_w["id"] + 1) if last_w and "id" in last_w else 1

    now = datetime.datetime.utcnow()
    new_item = {
        "id": next_w_id,
        "user_id": current_user.id,
        "franchise_id": franchise_id,
        "added_investment": total_inv,
        "added_roi": roi,
        "added_risk": "Medium Risk",
        "created_at": now
    }
    db["watchlists"].insert_one(new_item)

    last_n = db["notifications"].find_one(sort=[("id", -1)])
    next_n_id = (last_n["id"] + 1) if last_n and "id" in last_n else 1

    alert = {
        "id": next_n_id,
        "user_id": current_user.id,
        "franchise_id": franchise_id,
        "title": f"Added {f.name} to Watchlist",
        "message": f"You are now monitoring financial updates, royalty adjustments, and outlet growth for {f.name}.",
        "type": "watchlist_add",
        "is_read": False,
        "created_at": now
    }
    db["notifications"].insert_one(alert)

    return {"status": "added", "franchise_id": franchise_id}

@router.get("/notifications")
def get_notifications(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    notifs = list(db["notifications"].find({"user_id": current_user.id}).sort("created_at", -1))

    return [
        {
            "id": n["id"],
            "title": n.get("title"),
            "message": n.get("message"),
            "type": n.get("type"),
            "is_read": n.get("is_read", False),
            "date": n["created_at"].strftime("%b %d, %Y") if hasattr(n.get("created_at"), "strftime") else "Sep 2026",
            "franchise_id": n.get("franchise_id")
        }
        for n in notifs
    ]
