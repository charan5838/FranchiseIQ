from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.franchise import Franchise
from app.schemas.analysis import ComparisonRequest
from app.services.risk_engine import calculate_risk_score

router = APIRouter(prefix="/comparison", tags=["Franchise Comparison Engine"])

@router.post("/compare")
def compare_franchises(
    data: ComparisonRequest,
    db: Session = Depends(get_db)
):
    if len(data.franchise_ids) < 2 or len(data.franchise_ids) > 5:
        raise HTTPException(status_code=400, detail="Please select between 2 and 5 franchises to compare")

    franchises = db.query(Franchise).filter(Franchise.id.in_(data.franchise_ids)).all()
    if len(franchises) != len(data.franchise_ids):
        raise HTTPException(status_code=404, detail="One or more franchises could not be found")

    items = []
    for f in franchises:
        inv = f.investment
        fin = f.financial
        outlets = f.outlet_info
        fees = f.fees
        ops = f.operating_costs

        total_inv = inv.total_estimated_investment if inv else 3000000.0
        roi = fin.roi_annual if fin else 25.0
        payback = fin.payback_months if fin else 24.0
        monthly_rev = fin.actual_monthly_revenue if fin else 500000.0
        monthly_prof = fin.actual_monthly_profit if fin else 80000.0
        net_margin = fin.actual_net_margin if fin else 15.0
        royalty_pct = fees.royalty_percentage if fees else 5.0
        fee = inv.franchise_fee if inv else 500000.0
        mkt_fee = fees.marketing_fee_percentage if fees else 2.0
        closure_rate = outlets.closure_rate_pct if outlets else 2.5
        exp_rate = f.expansion_rate or 15.0

        confidence = 85.0
        if f.data_sources:
            confidence = sum(ds.confidence_level for ds in f.data_sources) / len(f.data_sources)

        risk = calculate_risk_score(
            total_investment=total_inv,
            royalty_pct=royalty_pct,
            closure_rate_pct=closure_rate,
            brand_age_years=f.brand_age_years or 5,
            expansion_rate_pct=exp_rate,
            data_confidence_score=confidence
        )

        loc_score = 78.0
        if f.location_analyses:
            loc_score = f.location_analyses[0].overall_location_score

        growth_score = min(98.0, max(40.0, exp_rate * 2.5 + (f.brand_age_years or 5) * 3.0))

        satisfaction = 80.0
        if f.franchisee_reports:
            satisfaction = sum(r.overall_satisfaction for r in f.franchisee_reports) / len(f.franchisee_reports)

        items.append({
            "id": f.id,
            "name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector": f.sector.name if f.sector else "General",
            "sub_sector": f.sub_sector,
            "model": f.franchise_model,
            "total_investment": total_inv,
            "franchise_fee": fee,
            "royalty_pct": royalty_pct,
            "marketing_fee_pct": mkt_fee,
            "monthly_revenue": monthly_rev,
            "monthly_expenses": ops.total_monthly_expenses if ops else monthly_rev * 0.8,
            "monthly_profit": monthly_prof,
            "net_margin_pct": net_margin,
            "roi_annual": roi,
            "payback_months": payback,
            "risk_score": risk["risk_score"],
            "risk_tier": risk["risk_tier"],
            "location_score": loc_score,
            "growth_score": growth_score,
            "data_confidence": confidence,
            "closure_rate_pct": closure_rate,
            "total_outlets": outlets.total_outlets if outlets else 50,
            "franchisee_satisfaction": satisfaction
        })

    # Determine Best Value Highlights
    # Lowest investment, Highest ROI, Lowest Payback, Lowest Risk, Highest Profit, Lowest Royalty, Highest Satisfaction
    best_highlights = {
        "lowest_investment_id": min(items, key=lambda x: x["total_investment"])["id"],
        "highest_roi_id": max(items, key=lambda x: x["roi_annual"])["id"],
        "fastest_payback_id": min(items, key=lambda x: x["payback_months"])["id"],
        "lowest_risk_id": min(items, key=lambda x: x["risk_score"])["id"],
        "highest_profit_id": max(items, key=lambda x: x["monthly_profit"])["id"],
        "lowest_royalty_id": min(items, key=lambda x: x["royalty_pct"])["id"],
        "highest_satisfaction_id": max(items, key=lambda x: x["franchisee_satisfaction"])["id"]
    }

    return {
        "franchises": items,
        "best_highlights": best_highlights
    }
