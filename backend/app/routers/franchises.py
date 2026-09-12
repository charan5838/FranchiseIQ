import re
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc, MongoDoc
from app.schemas.franchise import SectorOut, FranchiseSummary, FranchiseDetail
from app.services.claim_gap_engine import analyze_claim_gap
from app.services.risk_engine import calculate_risk_score
from app.services.projection_engine import generate_multi_year_projections

router = APIRouter(tags=["Franchises"])

class FranchiseSubmission(BaseModel):
    name: str
    sector_id: int
    sub_sector: str
    description: str
    founded_year: Optional[int] = 2022
    headquarters: str
    franchise_model: Optional[str] = "FOFO"
    space_min_sqft: Optional[float] = 400.0
    space_max_sqft: Optional[float] = 1000.0
    total_investment: float
    franchise_fee: Optional[float] = 500000.0
    monthly_revenue: float
    monthly_profit: float
    royalty_percentage: Optional[float] = 5.0
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None

@router.post("/franchises/submit")
def submit_franchise(data: FranchiseSubmission, db = Depends(get_db)):
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', data.name.strip().lower()).strip('-')
    if not base_slug:
        base_slug = "franchise-listing"
    slug = base_slug
    idx = 1
    while db["franchises"].find_one({"slug": slug}):
        slug = f"{base_slug}-{idx}"
        idx += 1

    founded_yr = data.founded_year or 2022
    brand_age = max(1, 2026 - founded_yr)

    # Determine next available ID
    last_f = db["franchises"].find_one(sort=[("id", -1)])
    next_id = (last_f["id"] + 1) if last_f and "id" in last_f else 1

    tot_inv = max(100000.0, data.total_investment)
    fee = data.franchise_fee if data.franchise_fee is not None else min(500000.0, tot_inv * 0.2)
    m_rev = max(50000.0, data.monthly_revenue)
    m_prof = max(10000.0, data.monthly_profit)
    roi = round((m_prof * 12.0 / tot_inv) * 100.0, 1)
    payback = round(tot_inv / m_prof, 1)
    margin = round((m_prof / m_rev) * 100.0, 1)

    sector_doc = db["sectors"].find_one({"id": data.sector_id})
    sector_info = {
        "id": sector_doc["id"],
        "name": sector_doc["name"],
        "category": sector_doc["category"],
        "icon": sector_doc["icon"],
        "description": sector_doc["description"]
    } if sector_doc else None

    now_str = datetime.datetime.utcnow()

    f_doc = {
        "id": next_id,
        "name": data.name.strip(),
        "slug": slug,
        "logo_url": None,
        "sector_id": data.sector_id,
        "sector": sector_info,
        "sub_sector": data.sub_sector.strip(),
        "description": data.description.strip(),
        "founded_year": founded_yr,
        "country": "India",
        "headquarters": data.headquarters.strip(),
        "website": data.website or None,
        "availability": "Available Pan-India",
        "franchise_model": data.franchise_model or "FOFO",
        "space_min_sqft": data.space_min_sqft or 400.0,
        "space_max_sqft": data.space_max_sqft or 1000.0,
        "expansion_rate": 15.0,
        "brand_age_years": brand_age,
        "is_active": True,
        "created_at": now_str,
        "updated_at": now_str,
        "investment": {
            "min_investment": tot_inv * 0.9,
            "max_investment": tot_inv * 1.15,
            "franchise_fee": fee,
            "security_deposit": 0.0,
            "setup_cost": tot_inv * 0.45,
            "equipment_cost": tot_inv * 0.25,
            "interior_cost": 0.0,
            "technology_cost": 0.0,
            "initial_inventory": 0.0,
            "working_capital": tot_inv * 0.15,
            "other_initial_expenses": 0.0,
            "total_estimated_investment": tot_inv,
            "last_updated": "September 2026"
        },
        "financial": {
            "claimed_monthly_revenue": m_rev * 1.2,
            "actual_monthly_revenue": m_rev,
            "claimed_annual_revenue": m_rev * 1.2 * 12.0,
            "actual_annual_revenue": m_rev * 12.0,
            "gross_margin": 55.0,
            "operating_margin": max(10.0, margin + 5.0),
            "claimed_net_margin": min(45.0, margin + 8.0),
            "actual_net_margin": margin,
            "claimed_monthly_profit": m_prof * 1.25,
            "actual_monthly_profit": m_prof,
            "claimed_annual_profit": m_prof * 1.25 * 12.0,
            "actual_annual_profit": m_prof * 12.0,
            "break_even_months": max(6, int(payback * 0.6)),
            "roi_annual": roi,
            "payback_months": payback,
            "revenue_stability_score": 82.0,
            "profit_stability_score": 80.0,
            "last_updated": "September 2026"
        },
        "operating_costs": {
            "monthly_rent": max(20000.0, m_rev * 0.12),
            "employee_salaries": max(25000.0, m_rev * 0.15),
            "utilities": 15000.0,
            "raw_materials_cogs": max(20000.0, m_rev * 0.35),
            "royalty_cost": m_rev * ((data.royalty_percentage or 5.0) / 100.0),
            "marketing_fee_cost": m_rev * 0.02,
            "insurance_accounting": 5000.0,
            "total_monthly_expenses": max(10000.0, m_rev - m_prof)
        },
        "fees": {
            "royalty_percentage": data.royalty_percentage or 5.0,
            "royalty_fixed": 0.0,
            "marketing_fee_percentage": 2.0,
            "technology_fee_monthly": 0.0,
            "renewal_fee": 0.0,
            "transfer_fee": 0.0
        },
        "support": {
            "training_provided": True,
            "training_days": 14,
            "site_selection_support": True,
            "marketing_support": True,
            "supply_chain_support": True,
            "operational_support": True,
            "software_pos_provided": True,
            "manuals_sop_provided": True,
            "field_support": True
        },
        "outlet_info": {
            "total_outlets": 12,
            "company_owned": 2,
            "franchise_owned": 10,
            "active_outlets": 12,
            "closed_outlets": 0,
            "closure_rate_pct": 0.0,
            "states_present": 2,
            "metros_count": 2,
            "tier2_count": 1,
            "tier3_count": 0
        },
        "data_sources": [{
            "metric_name": "Direct Franchisor Submission",
            "source_type": "REPORTED",
            "source_name": f"Submitted by Franchisor ({data.contact_email or 'Direct Entry'})",
            "methodology": "Direct platform listing submitted by brand representative, marked REPORTED pending on-site audit",
            "confidence_level": 80.0,
            "verified_by": "FranchiseIQ Community Review"
        }],
        "historical_financials": [],
        "outlet_history": [],
        "location_analyses": [],
        "reviews": [],
        "franchisee_reports": [],
        "source_config": {
            "official_website": data.website or f"https://{slug}.com",
            "franchise_information_url": f"https://{slug}.com/franchise",
            "fetch_status": "DEMO",
            "source_mode": "DEMO",
            "last_fetched_at": now_str,
            "last_successful_fetch_at": None,
            "error_message": None
        },
        "observations": []
    }

    db["franchises"].insert_one(f_doc)

    return {
        "status": "success",
        "franchise_id": next_id,
        "name": f_doc["name"],
        "slug": f_doc["slug"]
    }

@router.get("/sectors", response_model=List[SectorOut])
def get_sectors(db = Depends(get_db)):
    docs = list(db["sectors"].find({"is_active": True}).sort("name", 1))
    return [wrap_mongo_doc(clean_mongo_doc(d)) for d in docs]

@router.get("/franchises", response_model=List[FranchiseSummary])
def get_franchises(
    sector_id: Optional[int] = None,
    search: Optional[str] = None,
    min_investment: Optional[float] = None,
    max_investment: Optional[float] = None,
    min_roi: Optional[float] = None,
    max_payback: Optional[float] = None,
    risk_level: Optional[str] = None,
    sort_by: Optional[str] = "roi_desc",
    min_sqft: Optional[float] = None,
    max_sqft: Optional[float] = None,
    monthly_revenue: Optional[float] = None,
    monthly_income: Optional[float] = None,
    monthly_profit: Optional[float] = None,
    db = Depends(get_db)
):
    query: Dict[str, Any] = {"is_active": True}

    if sector_id:
        query["sector_id"] = sector_id

    if search:
        rgx = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [
            {"name": rgx},
            {"sub_sector": rgx},
            {"headquarters": rgx}
        ]


    raw_results = list(db["franchises"].find(query))
    results = [wrap_mongo_doc(clean_mongo_doc(d)) for d in raw_results]
    summaries = []

    for f in results:
        inv = f.investment
        fin = f.financial
        outlets = f.outlet_info
        fees = f.fees

        total_inv = inv.total_estimated_investment if inv else 3000000.0
        roi = fin.roi_annual if fin else 25.0
        payback = fin.payback_months if fin else 24.0
        monthly_rev = fin.actual_monthly_revenue if fin else 500000.0
        monthly_prof = fin.actual_monthly_profit if fin else 80000.0
        closure_rate = outlets.closure_rate_pct if outlets else 2.5
        royalty_pct = fees.royalty_percentage if fees else 5.0
        tot_outlets = outlets.total_outlets if outlets else 50

        # User Requirements vs Franchise Data Comparison Filters (Manual user-entered criteria preserved)
        if min_investment:
            norm_min_inv = min_investment * 100000.0 if min_investment < 10000.0 else min_investment
            if total_inv < norm_min_inv:
                continue
        if max_investment:
            norm_max_inv = max_investment * 100000.0 if max_investment < 10000.0 else max_investment
            if total_inv > norm_max_inv:
                continue
        if min_roi and roi < min_roi:
            continue
        if max_payback and payback > max_payback:
            continue

        # Space Requirements
        f_min_sqft = f.space_min_sqft or 0.0
        f_max_sqft = f.space_max_sqft or 999999.0
        if max_sqft and f_min_sqft > max_sqft:
            continue
        if min_sqft and f_max_sqft < min_sqft:
            continue

        # Monthly Revenue
        if monthly_revenue and monthly_rev < monthly_revenue:
            continue

        # Monthly Income & Monthly Profit
        if monthly_profit and monthly_prof < monthly_profit:
            continue
        if monthly_income and monthly_prof < monthly_income:
            continue

        # Risk calculation
        confidence = 85.0
        if f.data_sources:
            confidence = sum(ds.confidence_level for ds in f.data_sources) / len(f.data_sources)

        risk = calculate_risk_score(
            total_investment=total_inv,
            royalty_pct=royalty_pct,
            closure_rate_pct=closure_rate,
            brand_age_years=f.brand_age_years or 5,
            expansion_rate_pct=f.expansion_rate or 15.0,
            data_confidence_score=confidence
        )

        if risk_level and risk["risk_tier"] != risk_level:
            continue

        # Claim gap status
        claim_gap = "LOW"
        if fin and fin.claimed_monthly_profit > 0:
            gap_pct = (fin.claimed_monthly_profit - fin.actual_monthly_profit) / fin.claimed_monthly_profit * 100.0
            if gap_pct > 25.0:
                claim_gap = "HIGH"
            elif gap_pct > 12.0:
                claim_gap = "MEDIUM"

        primary_source = f.data_sources[0].source_type if f.data_sources else "ESTIMATED"
        source_mode = f.source_config.source_mode if f.source_config else "DEMO"

        sec_name = f.sector.name if (f.sector and hasattr(f.sector, 'name')) else "General"

        summary = FranchiseSummary(
            id=f.id,
            name=f.name,
            slug=f.slug,
            logo_url=f.logo_url,
            sector_id=f.sector_id,
            sector_name=sec_name,
            sub_sector=f.sub_sector,
            founded_year=f.founded_year or 2020,
            headquarters=f.headquarters,
            franchise_model=f.franchise_model or "FOFO",
            space_min_sqft=f.space_min_sqft or 500.0,
            space_max_sqft=f.space_max_sqft or 1500.0,
            expansion_rate=f.expansion_rate or 15.0,
            brand_age_years=f.brand_age_years or 5,
            total_investment=total_inv,
            franchise_fee=inv.franchise_fee if inv else 500000.0,
            monthly_revenue=monthly_rev,
            monthly_profit=monthly_prof,
            roi_annual=roi,
            payback_months=payback,
            total_outlets=tot_outlets,
            closure_rate_pct=closure_rate,
            royalty_pct=royalty_pct,
            risk_score=risk["risk_score"],
            risk_tier=risk["risk_tier"],
            primary_data_source=primary_source,
            data_confidence=confidence,
            claim_gap_severity=claim_gap
        )
        summaries.append(summary)


    # Sort results
    if sort_by == "roi_desc":
        summaries.sort(key=lambda x: x.roi_annual, reverse=True)
    elif sort_by == "roi_asc":
        summaries.sort(key=lambda x: x.roi_annual)
    elif sort_by == "investment_asc":
        summaries.sort(key=lambda x: x.total_investment)
    elif sort_by == "investment_desc":
        summaries.sort(key=lambda x: x.total_investment, reverse=True)
    elif sort_by == "payback_asc":
        summaries.sort(key=lambda x: x.payback_months)
    elif sort_by == "risk_asc":
        summaries.sort(key=lambda x: x.risk_score)

    return summaries

@router.get("/franchises/sector-profit-leaders")
def get_sector_profit_leaders(
    budget: Optional[float] = None,
    db = Depends(get_db)
):
    sectors = list(db["sectors"].find({"is_active": True}).sort("name", 1))
    results = []

    for sec in sectors:
        all_franchises_raw = list(db["franchises"].find({"sector_id": sec["id"], "is_active": True}))
        all_franchises = [wrap_mongo_doc(clean_mongo_doc(d)) for d in all_franchises_raw]
        if not all_franchises:
            continue

        franchise_items = []
        for f in all_franchises:
            inv = f.investment
            fin = f.financial
            outlets = f.outlet_info
            
            tot_inv = inv.total_estimated_investment if inv else 3000000.0
            act_prof = fin.actual_monthly_profit if fin else 80000.0
            act_rev = fin.actual_monthly_revenue if fin else 500000.0
            roi = fin.roi_annual if fin else 25.0
            payback = fin.payback_months if fin else 24.0
            margin = round((act_prof / act_rev * 100.0), 1) if act_rev > 0 else 15.0

            if budget and tot_inv > (budget * 1.35):
                continue

            primary_ds = f.data_sources[0] if f.data_sources else None
            tier = primary_ds.source_type if primary_ds else "ESTIMATED"

            franchise_items.append({
                "id": f.id,
                "name": f.name,
                "slug": f.slug,
                "sub_sector": f.sub_sector,
                "headquarters": f.headquarters,
                "total_investment": tot_inv,
                "monthly_revenue": act_rev,
                "monthly_profit": act_prof,
                "roi_annual": roi,
                "payback_months": payback,
                "net_margin_pct": margin,
                "verification_tier": tier,
                "space_sqft": f"{int(f.space_min_sqft)} - {int(f.space_max_sqft)} sq ft",
                "total_outlets": outlets.total_outlets if outlets else 50,
                "description": f.description
            })

        if not franchise_items:
            continue

        franchise_items.sort(key=lambda x: x["monthly_profit"], reverse=True)

        max_profit = franchise_items[0]["monthly_profit"]
        max_roi = max(x["roi_annual"] for x in franchise_items)
        top_leader = franchise_items[0]

        results.append({
            "sector_id": sec["id"],
            "sector_name": sec["name"],
            "category": sec["category"],
            "icon": sec["icon"],
            "description": sec["description"],
            "total_available_franchises": len(all_franchises),
            "matching_franchises_count": len(franchise_items),
            "highest_monthly_profit": max_profit,
            "highest_roi_annual": max_roi,
            "top_profit_leader": top_leader,
            "leaders": franchise_items[:4]
        })

    results.sort(key=lambda x: x["highest_monthly_profit"], reverse=True)
    return results

@router.get("/franchises/{id_or_slug}", response_model=FranchiseDetail)
def get_franchise_detail(id_or_slug: str, db = Depends(get_db)):
    if id_or_slug.isdigit():
        f_raw = db["franchises"].find_one({"id": int(id_or_slug)})
    else:
        f_raw = db["franchises"].find_one({"slug": id_or_slug})

    if not f_raw:
        raise HTTPException(status_code=404, detail="Franchise opportunity not found")

    f = wrap_mongo_doc(clean_mongo_doc(f_raw))

    inv = f.investment
    fin = f.financial
    outlets = f.outlet_info
    fees = f.fees
    ops = f.operating_costs
    support = f.support

    total_inv = inv.total_estimated_investment if inv else 3000000.0
    roi = fin.roi_annual if fin else 25.0
    payback = fin.payback_months if fin else 24.0
    monthly_rev = fin.actual_monthly_revenue if fin else 500000.0
    monthly_prof = fin.actual_monthly_profit if fin else 80000.0
    closure_rate = outlets.closure_rate_pct if outlets else 2.5
    royalty_pct = fees.royalty_percentage if fees else 5.0

    # Data confidence
    confidence = 85.0
    if f.data_sources:
        confidence = sum(ds.confidence_level for ds in f.data_sources) / len(f.data_sources)

    # Claim gap analysis
    claim_analysis = analyze_claim_gap(
        claimed_monthly_revenue=fin.claimed_monthly_revenue if fin else monthly_rev * 1.2,
        actual_monthly_revenue=monthly_rev,
        claimed_net_margin=fin.claimed_net_margin if fin else 22.0,
        actual_net_margin=fin.actual_net_margin if fin else 15.0,
        claimed_monthly_profit=fin.claimed_monthly_profit if fin else monthly_prof * 1.3,
        actual_monthly_profit=monthly_prof
    )

    # Risk analysis
    risk_analysis = calculate_risk_score(
        total_investment=total_inv,
        royalty_pct=royalty_pct,
        closure_rate_pct=closure_rate,
        brand_age_years=f.brand_age_years or 5,
        expansion_rate_pct=f.expansion_rate or 15.0,
        data_confidence_score=confidence
    )

    # Multi-year projections (1, 3, 5 years across Conservative, Expected, Optimistic)
    projections = generate_multi_year_projections(
        current_annual_revenue=fin.actual_annual_revenue if fin else monthly_rev * 12.0,
        current_annual_expenses=ops.total_monthly_expenses * 12.0 if ops else monthly_rev * 0.8 * 12.0,
        current_outlets=outlets.total_outlets if outlets else 50,
        total_investment=total_inv,
        expansion_rate_pct=f.expansion_rate or 15.0
    )

    # Franchisee satisfaction score calculation
    satisfaction = 78.0
    if f.franchisee_reports:
        satisfaction = sum(r.overall_satisfaction for r in f.franchisee_reports) / len(f.franchisee_reports)

    deal_score = round(
        (roi * 0.35) +
        (max(0, 100 - payback * 2.0) * 0.25) +
        (max(0, 100 - risk_analysis["risk_score"]) * 0.20) +
        ((satisfaction / 100.0 * 20.0)),
        1
    )

    reviews_out = [
        {
            "id": r.id,
            "user_name": r.get("user_name", "Verified Investor"),
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "created_at": r.created_at.strftime("%b %Y") if hasattr(r.created_at, 'strftime') else (str(r.created_at)[:7] if r.created_at else "Aug 2026")
        }
        for r in (f.reviews or []) if r.get("is_approved", True)
    ]

    primary_source = f.data_sources[0].source_type if f.data_sources else "ESTIMATED"

    # Date formatting for last_fetched
    last_f_time = None
    if f.source_config:
        last_f_time = f.source_config.last_successful_fetch_at or f.source_config.last_fetched_at
    if hasattr(last_f_time, 'strftime'):
        last_fetched_str = last_f_time.strftime("%d %b %Y, %I:%M %p")
    elif last_f_time:
        last_fetched_str = str(last_f_time)
    else:
        last_fetched_str = "Demo Data (Unfetched)"

    sec_name = f.sector.name if (f.sector and hasattr(f.sector, 'name')) else "General"

    obs_out = []
    for o in (f.observations[:20] if f.observations else []):
        f_at = o.fetched_at
        if hasattr(f_at, 'strftime'):
            f_at_str = f_at.strftime("%d %b %Y, %I:%M %p")
        elif f_at:
            f_at_str = str(f_at)
        else:
            f_at_str = "Unknown"

        obs_out.append({
            "field_name": o.field_name,
            "original_value": o.original_value,
            "normalized_value": o.normalized_value,
            "data_classification": o.data_classification,
            "source_type": o.source_type,
            "source_url": o.source_url,
            "confidence_score": o.confidence_score,
            "fetched_at": f_at_str
        })

    return FranchiseDetail(
        id=f.id,
        name=f.name,
        slug=f.slug,
        logo_url=f.logo_url,
        description=f.description,
        sector_id=f.sector_id,
        sector_name=sec_name,
        sub_sector=f.sub_sector,
        founded_year=f.founded_year,
        country=f.country,
        headquarters=f.headquarters,
        website=f.website,
        availability=f.availability,
        franchise_model=f.franchise_model,
        space_min_sqft=f.space_min_sqft,
        space_max_sqft=f.space_max_sqft,
        expansion_rate=f.expansion_rate,
        brand_age_years=f.brand_age_years,
        total_investment=total_inv,
        franchise_fee=inv.franchise_fee if inv else 500000.0,
        monthly_revenue=monthly_rev,
        monthly_profit=monthly_prof,
        roi_annual=roi,
        payback_months=payback,
        total_outlets=outlets.total_outlets if outlets else 50,
        closure_rate_pct=closure_rate,
        royalty_pct=royalty_pct,
        risk_score=risk_analysis["risk_score"],
        risk_tier=risk_analysis["risk_tier"],
        primary_data_source=primary_source,
        data_confidence=confidence,
        claim_gap_severity=claim_analysis["severity"],
        investment=inv,
        financial=fin,
        operating_costs=ops,
        fees=fees,
        outlet_info=outlets,
        support=support,
        historical_financials=f.historical_financials or [],
        data_sources=f.data_sources or [],
        reviews=reviews_out,
        claim_gap_analysis=claim_analysis,
        risk_analysis=risk_analysis,
        projections=projections,
        franchisee_satisfaction_score=round(satisfaction, 1),
        deal_attractiveness_score=min(98.0, max(20.0, deal_score)),
        source_status=f.source_config.fetch_status if f.source_config else "DEMO",
        source_mode=f.source_config.source_mode if f.source_config else "DEMO",
        official_website=f.source_config.official_website if f.source_config else f.website,
        franchise_information_url=f.source_config.franchise_information_url if f.source_config else (f"{f.website.rstrip('/')}/franchise" if f.website else None),
        last_fetched_at=last_fetched_str,
        observations=obs_out
    )
