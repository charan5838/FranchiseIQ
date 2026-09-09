from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User, Watchlist, Notification
from app.models.franchise import Franchise
from app.routers.auth import get_current_user
from app.services.risk_engine import calculate_risk_score

router = APIRouter(tags=["Watchlist & Alerts"])

@router.get("/watchlist")
def get_user_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    results = []

    for w in items:
        f = w.franchise
        if not f:
            continue
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

        # Delta calculation between added date and now
        inv_delta = current_inv - (w.added_investment or current_inv)
        roi_delta = current_roi - (w.added_roi or current_roi)

        results.append({
            "watchlist_id": w.id,
            "franchise_id": f.id,
            "name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector": f.sector.name if f.sector else "General",
            "added_date": w.created_at.strftime("%b %d, %Y") if w.created_at else "Sep 2026",
            "added_investment": w.added_investment,
            "current_investment": current_inv,
            "investment_delta": inv_delta,
            "added_roi": w.added_roi,
            "current_roi": current_roi,
            "roi_delta": round(roi_delta, 1),
            "added_risk": w.added_risk,
            "current_risk": risk["risk_tier"],
            "risk_score": risk["risk_score"],
            "payback_months": fin.payback_months if fin else 24.0,
            "monthly_profit": fin.actual_monthly_profit if fin else 75000.0
        })

    return results

@router.post("/watchlist/{franchise_id}")
def toggle_watchlist(
    franchise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.franchise_id == franchise_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "franchise_id": franchise_id}

    f = db.query(Franchise).filter(Franchise.id == franchise_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Franchise not found")

    inv = f.investment
    fin = f.financial
    total_inv = inv.total_estimated_investment if inv else 2500000.0
    roi = fin.roi_annual if fin else 25.0

    new_item = Watchlist(
        user_id=current_user.id,
        franchise_id=franchise_id,
        added_investment=total_inv,
        added_roi=roi,
        added_risk="Medium Risk"
    )
    db.add(new_item)

    # Trigger a watchlist alert notification
    alert = Notification(
        user_id=current_user.id,
        franchise_id=franchise_id,
        title=f"Added {f.name} to Watchlist",
        message=f"You are now monitoring financial updates, royalty adjustments, and outlet growth for {f.name}.",
        type="watchlist_add"
    )
    db.add(alert)
    db.commit()

    return {"status": "added", "franchise_id": franchise_id}

@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "date": n.created_at.strftime("%b %d, %Y") if n.created_at else "Sep 2026",
            "franchise_id": n.franchise_id
        }
        for n in notifs
    ]
