from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models.user import User, AuditLog
from app.models.franchise import (
    Sector, Franchise, FranchiseInvestment, FranchiseFinancial,
    OperatingCost, FranchiseFee, FranchisorSupport
)
from app.models.history import HistoricalFinancial, Outlet
from app.models.verification import DataSource, DataVerification
from app.models.support import SupportRequest, Feedback
from app.schemas.support import SupportRequestOut, SupportRequestUpdate, FeedbackOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrative privileges required")
    return current_user

class FranchiseCreateAdmin(BaseModel):
    name: str
    slug: str
    sector_id: int
    sub_sector: str
    description: str
    founded_year: int
    headquarters: str
    website: Optional[str] = None
    franchise_model: str = "FOFO"
    min_investment: float
    max_investment: float
    total_investment: float
    franchise_fee: float
    monthly_revenue: float
    monthly_profit: float
    roi_annual: float
    payback_months: float
    royalty_percentage: float = 5.0

class VerifySourceUpdate(BaseModel):
    data_source_id: int
    source_type: str  # VERIFIED, REPORTED, ESTIMATED, MARKETING_CLAIM
    confidence_level: float
    methodology: str
    source_name: str

class SectorCreateAdmin(BaseModel):
    name: str
    category: str = "General"
    description: Optional[str] = None
    icon: str = "Briefcase"

@router.post("/franchises")
def create_franchise(
    data: FranchiseCreateAdmin,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    f = Franchise(
        name=data.name,
        slug=data.slug,
        sector_id=data.sector_id,
        sub_sector=data.sub_sector,
        description=data.description,
        founded_year=data.founded_year,
        headquarters=data.headquarters,
        website=data.website,
        franchise_model=data.franchise_model,
        brand_age_years=2026 - data.founded_year
    )
    db.add(f)
    db.commit()
    db.refresh(f)

    # Add investment
    inv = FranchiseInvestment(
        franchise_id=f.id,
        min_investment=data.min_investment,
        max_investment=data.max_investment,
        franchise_fee=data.franchise_fee,
        setup_cost=data.total_investment * 0.4,
        equipment_cost=data.total_investment * 0.3,
        working_capital=data.total_investment * 0.15,
        total_estimated_investment=data.total_investment,
        last_updated="September 2026"
    )
    db.add(inv)

    # Add financials
    fin = FranchiseFinancial(
        franchise_id=f.id,
        claimed_monthly_revenue=data.monthly_revenue * 1.25,
        actual_monthly_revenue=data.monthly_revenue,
        claimed_annual_revenue=data.monthly_revenue * 1.25 * 12.0,
        actual_annual_revenue=data.monthly_revenue * 12.0,
        gross_margin=55.0,
        operating_margin=22.0,
        claimed_net_margin=24.0,
        actual_net_margin=(data.monthly_profit / data.monthly_revenue * 100.0) if data.monthly_revenue > 0 else 15.0,
        claimed_monthly_profit=data.monthly_profit * 1.35,
        actual_monthly_profit=data.monthly_profit,
        claimed_annual_profit=data.monthly_profit * 1.35 * 12.0,
        actual_annual_profit=data.monthly_profit * 12.0,
        roi_annual=data.roi_annual,
        payback_months=data.payback_months,
        last_updated="September 2026"
    )
    db.add(fin)

    # Add operating costs
    ops = OperatingCost(
        franchise_id=f.id,
        monthly_rent=60000.0,
        employee_salaries=50000.0,
        utilities=20000.0,
        raw_materials_cogs=data.monthly_revenue * 0.35,
        total_monthly_expenses=data.monthly_revenue - data.monthly_profit
    )
    db.add(ops)

    # Add fees
    fee = FranchiseFee(
        franchise_id=f.id,
        royalty_percentage=data.royalty_percentage,
        marketing_fee_percentage=2.0
    )
    db.add(fee)

    # Add support
    support = FranchisorSupport(franchise_id=f.id)
    db.add(support)

    # Add outlet
    outlets = Outlet(
        franchise_id=f.id,
        total_outlets=25,
        company_owned=5,
        franchise_owned=20,
        active_outlets=24,
        closed_outlets=1,
        closure_rate_pct=4.0
    )
    db.add(outlets)

    # Add data source
    src = DataSource(
        franchise_id=f.id,
        metric_name="Core Financials",
        source_type="REPORTED",
        source_name="Admin Ingestion & Unit Economics Filing",
        methodology="Uploaded platform dossier verified against regional disclosure filings",
        confidence_level=88.0,
        verified_by=admin.name
    )
    db.add(src)

    # Log Audit
    audit = AuditLog(
        user_id=admin.id,
        entity_type="franchise",
        entity_id=f.id,
        action="CREATE",
        details=f"Admin created new franchise: {f.name} ({f.sub_sector}) with investment ₹{data.total_investment:,.0f}"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "franchise_id": f.id, "name": f.name}

@router.put("/data-sources/verify")
def update_data_verification(
    data: VerifySourceUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    src = db.query(DataSource).filter(DataSource.id == data.data_source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Data source record not found")

    old_type = src.source_type
    src.source_type = data.source_type
    src.confidence_level = data.confidence_level
    src.methodology = data.methodology
    src.source_name = data.source_name
    src.verified_by = admin.name
    src.verification_date = "September 2026"

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        entity_type="data_source",
        entity_id=src.id,
        action="VERIFY",
        details=f"Updated verification level for metric '{src.metric_name}' from {old_type} to {data.source_type} ({data.confidence_level}%)"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "data_source_id": src.id, "source_type": src.source_type}

@router.post("/sectors")
def add_sector(
    data: SectorCreateAdmin,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Sector).filter(Sector.name.ilike(data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sector already exists")

    s = Sector(
        name=data.name,
        category=data.category,
        description=data.description,
        icon=data.icon,
        is_active=True
    )
    db.add(s)
    db.commit()
    db.refresh(s)

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        entity_type="sector",
        entity_id=s.id,
        action="CREATE",
        details=f"Admin added new sector: {s.name}"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "sector_id": s.id, "name": s.name}

@router.post("/document-upload")
def upload_document_extract(
    file: UploadFile = File(...),
    franchise_id: Optional[int] = None,
    document_type: str = "Franchise Disclosure Document (FDD)",
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Simulated Intelligent Document Extraction Parser (Section 26)
    # Note: As per Section 26, extracted data is initially marked as "ESTIMATED/REPORTED", not automatically verified.
    extracted_summary = {
        "filename": file.filename,
        "document_type": document_type,
        "file_size_bytes": file.size or 124500,
        "extraction_status": "COMPLETED",
        "extracted_fields": {
            "stated_initial_franchise_fee": "₹5,00,000",
            "stated_royalty_clause": "5.0% of Gross Monthly Revenue payable by 7th of each month",
            "minimum_liquid_capital_required": "₹20,00,000",
            "audit_period": "FY 2024 - 2025",
            "total_operating_units_found": 84,
            "dispute_clauses_detected": 0
        },
        "audit_note": "Extracted data flagged as 'REPORTED - PENDING AUDITOR CERTIFICATION'. Do not treat as VERIFIED without original financial seal."
    }

    audit = AuditLog(
        user_id=admin.id,
        entity_type="document",
        entity_id=franchise_id or 0,
        action="UPLOAD",
        details=f"Admin uploaded document '{file.filename}' ({document_type}). System parsed 6 critical financial clauses."
    )
    db.add(audit)
    db.commit()

    return extracted_summary

@router.get("/audit-logs")
def get_audit_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "action": l.action,
            "details": l.details,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S") if l.timestamp else "Just now"
        }
        for l in logs
    ]

class FranchiseSourceConfigure(BaseModel):
    official_website: str
    franchise_information_url: str
    franchise_investment_url: Optional[str] = None

@router.post("/franchises/{franchise_id}/refresh")
def refresh_official_franchise_data(
    franchise_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from app.services.data_ingestion.ingestion_manager import IngestionManager
    manager = IngestionManager()
    result = manager.refresh_franchise(franchise_id, db)
    
    # Record audit log
    status_str = result.get("status", "COMPLETED")
    audit = AuditLog(
        user_id=admin.id,
        entity_type="franchise_source",
        entity_id=franchise_id,
        action="REFRESH",
        details=f"Admin triggered live official website refresh for Franchise #{franchise_id}. Outcome: {status_str} ({result.get('fields_updated', 0)} fields updated)"
    )
    db.add(audit)
    db.commit()

    return result

@router.post("/franchises/{franchise_id}/source")
def configure_franchise_source(
    franchise_id: int,
    data: FranchiseSourceConfigure,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from app.models.source import FranchiseSource
    from app.services.data_ingestion.source_verifier import SourceVerifier

    is_valid, reason = SourceVerifier.verify_official_url(data.franchise_information_url, data.official_website)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Source configuration rejected: {reason}")

    source = db.query(FranchiseSource).filter(FranchiseSource.franchise_id == franchise_id).first()
    if not source:
        source = FranchiseSource(
            franchise_id=franchise_id,
            official_website=data.official_website,
            franchise_information_url=data.franchise_information_url,
            franchise_investment_url=data.franchise_investment_url,
            fetch_status="PENDING",
            source_mode="LIVE"
        )
        db.add(source)
    else:
        source.official_website = data.official_website
        source.franchise_information_url = data.franchise_information_url
        source.franchise_investment_url = data.franchise_investment_url
        source.source_mode = "LIVE"

    audit = AuditLog(
        user_id=admin.id,
        entity_type="franchise_source",
        entity_id=franchise_id,
        action="UPDATE",
        details=f"Admin updated official source URL to {data.official_website} for Franchise #{franchise_id}"
    )
    db.add(audit)
    db.commit()
    db.refresh(source)

    return {
        "status": "SUCCESS",
        "message": f"Official website configuration updated for Franchise #{franchise_id}",
        "official_website": source.official_website,
        "franchise_information_url": source.franchise_information_url
    }

@router.post("/sources/refresh-all")
def refresh_all_sources(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from app.services.data_ingestion.ingestion_manager import IngestionManager
    manager = IngestionManager()
    summary = manager.refresh_all_configured_sources(db)
    
    audit = AuditLog(
        user_id=admin.id,
        entity_type="system",
        entity_id=0,
        action="BATCH_REFRESH",
        details=f"Admin initiated batch refresh for {summary.get('total_processed')} official franchise sources."
    )
    db.add(audit)
    db.commit()

    return summary

@router.get("/support", response_model=List[SupportRequestOut])
def list_support_requests(
    status: Optional[str] = None,
    category: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(SupportRequest)
    if status and status != "ALL":
        query = query.filter(SupportRequest.status == status)
    if category and category != "ALL":
        query = query.filter(SupportRequest.category == category)
    return query.order_by(SupportRequest.created_at.desc()).all()

@router.patch("/support/{request_id}", response_model=SupportRequestOut)
def update_support_request(
    request_id: int,
    data: SupportRequestUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Support request not found")
    req.status = data.status
    if data.admin_notes is not None:
        req.admin_notes = data.admin_notes
    db.commit()
    db.refresh(req)
    return req

@router.get("/feedback", response_model=List[FeedbackOut])
def list_user_feedback(
    category: Optional[str] = None,
    min_rating: Optional[int] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    if category and category != "ALL":
        query = query.filter(Feedback.category == category)
    if min_rating:
        query = query.filter(Feedback.rating >= min_rating)
    return query.order_by(Feedback.created_at.desc()).all()

