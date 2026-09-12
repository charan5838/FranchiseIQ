from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
from app.schemas.analysis import RecommendationRequest, RankedFranchiseOut
from app.services.scoring_engine import calculate_personalized_score
from app.services.risk_engine import calculate_risk_score

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])

@router.post("/rank", response_model=List[RankedFranchiseOut])
def rank_franchises(
    data: RecommendationRequest,
    db = Depends(get_db)
):
    query: Dict[str, Any] = {"is_active": True}
    if data.preferred_sector_id:
        query["sector_id"] = data.preferred_sector_id

    raw_list = list(db["franchises"].find(query))
    franchises = [wrap_mongo_doc(clean_mongo_doc(f)) for f in raw_list]
    ranked_list = []

    for f in franchises:
        inv = f.investment
        fin = f.financial
        outlets = f.outlet_info
        fees = f.fees

        total_inv = inv.total_estimated_investment if inv else 3000000.0
        roi = fin.roi_annual if fin else 25.0
        payback = fin.payback_months if fin else 24.0
        monthly_rev = fin.actual_monthly_revenue if fin else 500000.0
        monthly_prof = fin.actual_monthly_profit if fin else 80000.0

        # Calculate personalized score
        score_res = calculate_personalized_score(
            franchise=f,
            user_budget=data.budget,
            user_city=data.city,
            user_locality=data.locality,
            user_area_sqft=data.shop_area_sqft,
            user_risk_pref=data.risk_preference,
            user_desired_return=data.desired_return_pct,
            user_max_payback=data.max_payback_months,
            user_goal=data.goal
        )

        # Risk calculation
        confidence = 85.0
        if f.data_sources:
            confidence = sum(ds.confidence_level for ds in f.data_sources) / len(f.data_sources)

        risk = calculate_risk_score(
            total_investment=total_inv,
            royalty_pct=fees.royalty_percentage if fees else 5.0,
            closure_rate_pct=outlets.closure_rate_pct if outlets else 2.5,
            brand_age_years=f.brand_age_years or 5,
            expansion_rate_pct=f.expansion_rate or 15.0,
            data_confidence_score=confidence
        )

        loc_score = 78.0
        if f.location_analyses:
            loc_score = f.location_analyses[0].overall_location_score

        claim_gap = "LOW"
        if fin and fin.claimed_monthly_profit > 0:
            gap_pct = (fin.claimed_monthly_profit - fin.actual_monthly_profit) / fin.claimed_monthly_profit * 100.0
            if gap_pct > 25.0:
                claim_gap = "HIGH"
            elif gap_pct > 12.0:
                claim_gap = "MODERATE"

        primary_source = f.data_sources[0].source_type if f.data_sources else "ESTIMATED"
        sec_name = f.sector.name if (f.sector and hasattr(f.sector, 'name')) else "General"

        ranked_list.append({
            "franchise_id": f.id,
            "name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector_name": sec_name,
            "sub_sector": f.sub_sector,
            "total_investment": total_inv,
            "monthly_revenue": monthly_rev,
            "monthly_profit": monthly_prof,
            "roi_annual": roi,
            "payback_months": payback,
            "risk_score": risk["risk_score"],
            "risk_tier": risk["risk_tier"],
            "location_score": loc_score,
            "overall_score": score_res["overall_score"],
            "data_confidence": confidence,
            "primary_source_type": primary_source,
            "score_breakdown": score_res["score_breakdown"],
            "budget_assessment": score_res["budget_assessment"],
            "space_assessment": score_res["space_assessment"],
            "why_recommended": score_res["why_recommended"],
            "key_risks": score_res["key_risks"],
            "claim_gap_severity": claim_gap
        })

    ranked_list.sort(key=lambda x: x["overall_score"], reverse=True)

    results = []
    for idx, item in enumerate(ranked_list, start=1):
        results.append(RankedFranchiseOut(rank=idx, **item))

    return results
