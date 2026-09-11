import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models.franchise import Franchise
from app.models.source import FranchiseSource, DataObservation, DataFetchLog
from app.services.data_ingestion.ingestion_manager import IngestionManager

router = APIRouter(tags=["Data Sources & Provenance"])

@router.get("/sources")
def get_all_sources(db: Session = Depends(get_db)):
    """
    Returns all configured franchise official website sources with their current fetch status,
    data classification, and last update timestamp.
    """
    franchises = db.query(Franchise).filter(Franchise.is_active == True).order_by(Franchise.name).all()
    results = []

    for f in franchises:
        src = f.source_config
        # If not initialized, produce clean default representation
        off_url = src.official_website if src else (f.website or f"https://{f.slug.replace('-', '')}.com")
        info_url = src.franchise_information_url if src else f"{off_url.rstrip('/')}/franchise"
        status = src.fetch_status if src else "DEMO"
        mode = src.source_mode if src else "DEMO"
        last_updated = src.last_successful_fetch_at if (src and src.last_successful_fetch_at) else (src.last_fetched_at if src else None)

        obs_count = len(f.observations) if f.observations else 0
        claims_count = sum(1 for o in f.observations if o.data_classification == "MARKETING_CLAIM") if f.observations else 0

        results.append({
            "franchise_id": f.id,
            "franchise_name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector_name": f.sector.name if f.sector else "General",
            "source_name": "Official Company Website",
            "source_type": "OFFICIAL_WEBSITE",
            "official_website": off_url,
            "franchise_information_url": info_url,
            "fetch_status": status,
            "source_mode": mode,
            "data_classification": "MARKETING_CLAIM" if claims_count > 0 else "FACTUAL_DISCLOSURE",
            "last_updated": last_updated.strftime("%d %b %Y, %I:%M %p") if last_updated else "Demo / Unfetched",
            "observations_count": obs_count,
            "error_message": src.error_message if src else None
        })

    return results

@router.get("/sources/{franchise_id}/observations")
def get_franchise_observations(franchise_id: int, db: Session = Depends(get_db)):
    """
    Returns the complete historical observation audit trail for a specific franchise.
    Tracks exact source URL, raw text, normalized value, and classification over time.
    """
    franchise = db.query(Franchise).filter(Franchise.id == franchise_id).first()
    if not franchise:
        raise HTTPException(status_code=404, detail="Franchise not found")

    observations = db.query(DataObservation).filter(
        DataObservation.franchise_id == franchise_id
    ).order_by(DataObservation.fetched_at.desc()).limit(100).all()

    return {
        "franchise_id": franchise.id,
        "franchise_name": franchise.name,
        "official_website": franchise.source_config.official_website if franchise.source_config else franchise.website,
        "total_observations": len(observations),
        "observations": [
            {
                "id": o.id,
                "field_name": o.field_name,
                "original_value": o.original_value,
                "normalized_value": o.normalized_value,
                "currency": o.currency,
                "source_url": o.source_url,
                "source_domain": o.source_domain,
                "source_type": o.source_type,
                "data_classification": o.data_classification,
                "confidence_score": o.confidence_score,
                "fetched_at": o.fetched_at.strftime("%d %b %Y, %I:%M %p") if o.fetched_at else "Unknown"
            }
            for o in observations
        ]
    }

@router.get("/admin/data-quality-summary")
def get_data_quality_summary(db: Session = Depends(get_db)):
    """
    Returns platform-wide data quality telemetry for hackathon inspection and administrative oversight.
    """
    total_franchises = db.query(Franchise).filter(Franchise.is_active == True).count()
    sources = db.query(FranchiseSource).all()
    
    live_sources_count = sum(1 for s in sources if s.source_mode == "LIVE")
    successful_count = sum(1 for s in sources if s.fetch_status == "SUCCESS")
    partial_count = sum(1 for s in sources if s.fetch_status == "PARTIAL_SUCCESS")
    unavailable_count = sum(1 for s in sources if s.fetch_status in ("UNAVAILABLE", "BLOCKED", "TIMEOUT", "NOT_FOUND"))
    
    total_observations = db.query(DataObservation).count()
    marketing_claims_count = db.query(DataObservation).filter(DataObservation.data_classification == "MARKETING_CLAIM").count()
    factual_disclosures_count = db.query(DataObservation).filter(DataObservation.data_classification == "FACTUAL_DISCLOSURE").count()

    latest_fetch = db.query(DataFetchLog).order_by(DataFetchLog.fetched_at.desc()).first()
    last_refresh_time = latest_fetch.fetched_at.strftime("%d %b %Y, %I:%M %p") if latest_fetch else "Initial Seed"

    return {
        "total_franchises": total_franchises,
        "live_sources": live_sources_count,
        "successfully_fetched": successful_count,
        "partially_fetched": partial_count,
        "unavailable": unavailable_count,
        "total_observations": total_observations,
        "marketing_claims": marketing_claims_count,
        "factual_disclosures": factual_disclosures_count,
        "estimated_values": max(0, total_franchises - live_sources_count),
        "last_refresh": last_refresh_time,
        "refresh_interval_hours": 24,
        "system_status": "OPERATIONAL"
    }
