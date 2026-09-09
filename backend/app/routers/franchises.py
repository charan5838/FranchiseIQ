from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.franchise import Sector, Franchise
from app.schemas.franchise import SectorOut, FranchiseSummary, FranchiseDetail
from app.services.claim_gap_engine import analyze_claim_gap
from app.services.risk_engine import calculate_risk_score
from app.services.projection_engine import generate_multi_year_projections

router = APIRouter(tags=["Franchises"])

@router.get("/sectors", response_model=List[SectorOut])
def get_sectors(db: Session = Depends(get_db)):
    return db.query(Sector).filter(Sector.is_active == True).order_by(Sector.name).all()

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
    db: Session = Depends(get_db)
):
    query = db.query(Franchise).filter(Franchise.is_active == True)

    if sector_id:
        query = query.filter(Franchise.sector_id == sector_id)

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Franchise.name.ilike(term)) |
            (Franchise.sub_sector.ilike(term)) |
            (Franchise.headquarters.ilike(term))
        )

    results = query.all()
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

        # Filter criteria
        if min_investment and total_inv < min_investment:
            continue
        if max_investment and total_inv > max_investment:
            continue
        if min_roi and roi < min_roi:
            continue
        if max_payback and payback > max_payback:
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
                claim_gap = "MODERATE"

        # Primary source type
        primary_source = "ESTIMATED"
        if f.data_sources:
            primary_source = f.data_sources[0].source_type

        summaries.append(FranchiseSummary(
            id=f.id,
            name=f.name,
            slug=f.slug,
            logo_url=f.logo_url,
            sector_id=f.sector_id,
            sector_name=f.sector.name if f.sector else "General",
            sub_sector=f.sub_sector,
            founded_year=f.founded_year,
            headquarters=f.headquarters,
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
            total_outlets=tot_outlets,
            closure_rate_pct=closure_rate,
            royalty_pct=royalty_pct,
            risk_score=risk["risk_score"],
            risk_tier=risk["risk_tier"],
            primary_data_source=primary_source,
            data_confidence=confidence,
            claim_gap_severity=claim_gap
        ))

    # Sort
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
    db: Session = Depends(get_db)
):
    sectors = db.query(Sector).filter(Sector.is_active == True).order_by(Sector.name).all()
    results = []

    for sec in sectors:
        query = db.query(Franchise).filter(Franchise.sector_id == sec.id, Franchise.is_active == True)
        all_franchises = query.all()
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
            "sector_id": sec.id,
            "sector_name": sec.name,
            "category": sec.category,
            "icon": sec.icon,
            "description": sec.description,
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
def get_franchise_detail(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        f = db.query(Franchise).filter(Franchise.id == int(id_or_slug)).first()
    else:
        f = db.query(Franchise).filter(Franchise.slug == id_or_slug).first()

    if not f:
        raise HTTPException(status_code=404, detail="Franchise opportunity not found")

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

    # Deal Attractiveness Score (0-100)
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
            "user_name": r.user.name if r.user else "Verified Investor",
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "created_at": r.created_at.strftime("%b %Y") if r.created_at else "Aug 2026"
        }
        for r in f.reviews if r.is_approved
    ]

    primary_source = f.data_sources[0].source_type if f.data_sources else "ESTIMATED"

    return FranchiseDetail(
        id=f.id,
        name=f.name,
        slug=f.slug,
        logo_url=f.logo_url,
        description=f.description,
        sector_id=f.sector_id,
        sector_name=f.sector.name if f.sector else "General",
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
        historical_financials=f.historical_financials,
        data_sources=f.data_sources,
        reviews=reviews_out,
        claim_gap_analysis=claim_analysis,
        risk_analysis=risk_analysis,
        projections=projections,
        franchisee_satisfaction_score=round(satisfaction, 1),
        deal_attractiveness_score=min(98.0, max(20.0, deal_score))
    )
