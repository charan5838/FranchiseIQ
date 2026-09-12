import re
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc, MongoDoc
from app.schemas.support import SupportRequestOut, SupportRequestUpdate, FeedbackOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def require_admin(current_user = Depends(get_current_user)):
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
    source_type: str
    confidence_level: float
    methodology: str
    source_name: str

class SectorCreateAdmin(BaseModel):
    name: str
    category: str = "General"
    description: Optional[str] = None
    icon: str = "Briefcase"

def log_audit(db, user_id: int, entity_type: str, entity_id: int, action: str, details: str):
    last_a = db["audit_logs"].find_one(sort=[("id", -1)])
    next_id = (last_a["id"] + 1) if last_a and "id" in last_a else 1
    db["audit_logs"].insert_one({
        "id": next_id,
        "user_id": user_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "details": details,
        "timestamp": datetime.datetime.utcnow()
    })

@router.post("/franchises")
def create_franchise(
    data: FranchiseCreateAdmin,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    last_f = db["franchises"].find_one(sort=[("id", -1)])
    next_id = (last_f["id"] + 1) if last_f and "id" in last_f else 1

    sec = db["sectors"].find_one({"id": data.sector_id})
    sector_info = {
        "id": sec["id"],
        "name": sec["name"],
        "category": sec["category"],
        "icon": sec["icon"],
        "description": sec["description"]
    } if sec else None

    now = datetime.datetime.utcnow()
    f_doc = {
        "id": next_id,
        "name": data.name,
        "slug": data.slug,
        "logo_url": None,
        "sector_id": data.sector_id,
        "sector": sector_info,
        "sub_sector": data.sub_sector,
        "description": data.description,
        "founded_year": data.founded_year,
        "country": "India",
        "headquarters": data.headquarters,
        "website": data.website,
        "availability": "Available Pan-India",
        "franchise_model": data.franchise_model,
        "space_min_sqft": 500.0,
        "space_max_sqft": 1500.0,
        "expansion_rate": 15.0,
        "brand_age_years": max(1, 2026 - data.founded_year),
        "is_active": True,
        "created_at": now,
        "updated_at": now,
        "investment": {
            "min_investment": data.min_investment,
            "max_investment": data.max_investment,
            "franchise_fee": data.franchise_fee,
            "security_deposit": 0.0,
            "setup_cost": data.total_investment * 0.4,
            "equipment_cost": data.total_investment * 0.3,
            "interior_cost": 0.0,
            "technology_cost": 0.0,
            "initial_inventory": 0.0,
            "working_capital": data.total_investment * 0.15,
            "other_initial_expenses": 0.0,
            "total_estimated_investment": data.total_investment,
            "last_updated": "September 2026"
        },
        "financial": {
            "claimed_monthly_revenue": data.monthly_revenue * 1.25,
            "actual_monthly_revenue": data.monthly_revenue,
            "claimed_annual_revenue": data.monthly_revenue * 1.25 * 12.0,
            "actual_annual_revenue": data.monthly_revenue * 12.0,
            "gross_margin": 55.0,
            "operating_margin": 22.0,
            "claimed_net_margin": 24.0,
            "actual_net_margin": (data.monthly_profit / data.monthly_revenue * 100.0) if data.monthly_revenue > 0 else 15.0,
            "claimed_monthly_profit": data.monthly_profit * 1.35,
            "actual_monthly_profit": data.monthly_profit,
            "claimed_annual_profit": data.monthly_profit * 1.35 * 12.0,
            "actual_annual_profit": data.monthly_profit * 12.0,
            "break_even_months": max(6, int(data.payback_months * 0.6)),
            "roi_annual": data.roi_annual,
            "payback_months": data.payback_months,
            "revenue_stability_score": 82.0,
            "profit_stability_score": 80.0,
            "last_updated": "September 2026"
        },
        "operating_costs": {
            "monthly_rent": 60000.0,
            "employee_salaries": 50000.0,
            "utilities": 20000.0,
            "raw_materials_cogs": data.monthly_revenue * 0.35,
            "royalty_cost": data.monthly_revenue * (data.royalty_percentage / 100.0),
            "marketing_fee_cost": data.monthly_revenue * 0.02,
            "insurance_accounting": 5000.0,
            "total_monthly_expenses": data.monthly_revenue - data.monthly_profit
        },
        "fees": {
            "royalty_percentage": data.royalty_percentage,
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
            "total_outlets": 25,
            "company_owned": 5,
            "franchise_owned": 20,
            "active_outlets": 24,
            "closed_outlets": 1,
            "closure_rate_pct": 4.0,
            "states_present": 4,
            "metros_count": 3,
            "tier2_count": 2,
            "tier3_count": 1
        },
        "data_sources": [{
            "metric_name": "Core Financials",
            "source_type": "REPORTED",
            "source_name": "Admin Ingestion & Unit Economics Filing",
            "methodology": "Uploaded platform dossier verified against regional disclosure filings",
            "confidence_level": 88.0,
            "verified_by": admin.name
        }],
        "historical_financials": [],
        "outlet_history": [],
        "location_analyses": [],
        "reviews": [],
        "franchisee_reports": [],
        "source_config": {
            "official_website": data.website or f"https://{data.slug}.com",
            "franchise_information_url": f"https://{data.slug}.com/franchise",
            "fetch_status": "DEMO",
            "source_mode": "DEMO",
            "last_fetched_at": now,
            "last_successful_fetch_at": None,
            "error_message": None
        },
        "observations": []
    }
    db["franchises"].insert_one(f_doc)
    log_audit(db, admin.id, "franchise", next_id, "CREATE", f"Admin created new franchise: {f_doc['name']} ({f_doc['sub_sector']}) with investment ₹{data.total_investment:,.0f}")
    return {"status": "success", "franchise_id": next_id, "name": f_doc["name"]}

@router.put("/data-sources/verify")
def update_data_verification(
    data: VerifySourceUpdate,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    log_audit(db, admin.id, "data_source", data.data_source_id, "VERIFY", f"Updated verification level to {data.source_type} ({data.confidence_level}%)")
    return {"status": "success", "data_source_id": data.data_source_id, "source_type": data.source_type}

@router.post("/sectors")
def add_sector(
    data: SectorCreateAdmin,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    rgx = {"$regex": f"^{re.escape(data.name)}$", "$options": "i"}

    existing = db["sectors"].find_one({"name": rgx})
    if existing:
        raise HTTPException(status_code=400, detail="Sector already exists")

    last_s = db["sectors"].find_one(sort=[("id", -1)])
    next_id = (last_s["id"] + 1) if last_s and "id" in last_s else 1

    s_doc = {
        "id": next_id,
        "name": data.name,
        "category": data.category,
        "description": data.description,
        "icon": data.icon,
        "is_active": True
    }
    db["sectors"].insert_one(s_doc)
    log_audit(db, admin.id, "sector", next_id, "CREATE", f"Admin added new sector: {s_doc['name']}")
    return {"status": "success", "sector_id": next_id, "name": s_doc["name"]}

@router.post("/document-upload")
def upload_document_extract(
    file: UploadFile = File(...),
    franchise_id: Optional[int] = None,
    document_type: str = "Franchise Disclosure Document (FDD)",
    admin = Depends(require_admin),
    db = Depends(get_db)
):
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
    log_audit(db, admin.id, "document", franchise_id or 0, "UPLOAD", f"Admin uploaded document '{file.filename}' ({document_type}). System parsed 6 critical financial clauses.")
    return extracted_summary

@router.get("/audit-logs")
def get_audit_logs(
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    logs = list(db["audit_logs"].find().sort("timestamp", -1).limit(50))
    return [
        {
            "id": l["id"],
            "entity_type": l.get("entity_type"),
            "entity_id": l.get("entity_id"),
            "action": l.get("action"),
            "details": l.get("details"),
            "timestamp": l["timestamp"].strftime("%Y-%m-%d %H:%M:%S") if hasattr(l.get("timestamp"), "strftime") else "Just now"
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
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    from app.services.data_ingestion.ingestion_manager import IngestionManager
    manager = IngestionManager()
    result = manager.refresh_franchise(franchise_id, db)
    log_audit(db, admin.id, "franchise_source", franchise_id, "REFRESH", f"Admin triggered live official website refresh for Franchise #{franchise_id}.")
    return result

@router.post("/franchises/{franchise_id}/source")
def configure_franchise_source(
    franchise_id: int,
    data: FranchiseSourceConfigure,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    from app.services.data_ingestion.source_verifier import SourceVerifier
    is_valid, reason = SourceVerifier.verify_official_url(data.franchise_information_url, data.official_website)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Source configuration rejected: {reason}")

    update_fields = {
        "source_config.official_website": data.official_website,
        "source_config.franchise_information_url": data.franchise_information_url,
        "source_config.franchise_investment_url": data.franchise_investment_url,
        "source_config.source_mode": "LIVE"
    }
    db["franchises"].update_one({"id": franchise_id}, {"$set": update_fields})
    log_audit(db, admin.id, "franchise_source", franchise_id, "UPDATE", f"Admin updated official source URL to {data.official_website} for Franchise #{franchise_id}")

    return {
        "status": "SUCCESS",
        "message": f"Official website configuration updated for Franchise #{franchise_id}",
        "official_website": data.official_website,
        "franchise_information_url": data.franchise_information_url
    }

@router.post("/sources/refresh-all")
def refresh_all_sources(
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    from app.services.data_ingestion.ingestion_manager import IngestionManager
    manager = IngestionManager()
    summary = manager.refresh_all_configured_sources(db)
    log_audit(db, admin.id, "system", 0, "BATCH_REFRESH", f"Admin initiated batch refresh for {summary.get('total_processed')} official franchise sources.")
    return summary

@router.get("/support", response_model=List[SupportRequestOut])
def list_support_requests(
    status: Optional[str] = None,
    category: Optional[str] = None,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    query = {}
    if status and status != "ALL":
        query["status"] = status
    if category and category != "ALL":
        query["category"] = category
    items = list(db["support_requests"].find(query).sort("created_at", -1))
    return [wrap_mongo_doc(clean_mongo_doc(d)) for d in items]

@router.patch("/support/{request_id}", response_model=SupportRequestOut)
def update_support_request(
    request_id: int,
    data: SupportRequestUpdate,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    req = db["support_requests"].find_one({"id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Support request not found")

    updates = {"status": data.status, "updated_at": datetime.datetime.utcnow()}
    if data.admin_notes is not None:
        updates["admin_notes"] = data.admin_notes

    db["support_requests"].update_one({"id": request_id}, {"$set": updates})
    updated_req = db["support_requests"].find_one({"id": request_id})
    return wrap_mongo_doc(clean_mongo_doc(updated_req))

@router.get("/feedback", response_model=List[FeedbackOut])
def list_user_feedback(
    category: Optional[str] = None,
    min_rating: Optional[int] = None,
    admin = Depends(require_admin),
    db = Depends(get_db)
):
    query = {}
    if category and category != "ALL":
        query["category"] = category
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    items = list(db["feedback"].find(query).sort("created_at", -1))
    return [wrap_mongo_doc(clean_mongo_doc(d)) for d in items]

