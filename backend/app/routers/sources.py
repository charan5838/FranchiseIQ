import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
from app.services.data_ingestion.ingestion_manager import IngestionManager

router = APIRouter(tags=["Data Sources & Provenance"])

@router.get("/sources")
def get_all_sources(db = Depends(get_db)):
    raw_list = list(db["franchises"].find({"is_active": True}).sort("name", 1))
    franchises = [wrap_mongo_doc(clean_mongo_doc(f)) for f in raw_list]
    results = []

    for f in franchises:
        src = f.source_config
        off_url = src.official_website if src else (f.website or f"https://{f.slug.replace('-', '')}.com")
        info_url = src.franchise_information_url if src else f"{off_url.rstrip('/')}/franchise"
        status = src.fetch_status if src else "DEMO"
        mode = src.source_mode if src else "DEMO"
        last_updated = src.last_successful_fetch_at if (src and src.last_successful_fetch_at) else (src.last_fetched_at if src else None)

        obs_count = len(f.observations) if f.observations else 0
        claims_count = sum(1 for o in f.observations if o.data_classification == "MARKETING_CLAIM") if f.observations else 0

        sec_name = f.sector.name if (f.sector and hasattr(f.sector, 'name')) else "General"
        last_updated_str = last_updated.strftime("%d %b %Y, %I:%M %p") if hasattr(last_updated, "strftime") else "Demo / Unfetched"

        results.append({
            "franchise_id": f.id,
            "franchise_name": f.name,
            "slug": f.slug,
            "logo_url": f.logo_url,
            "sector_name": sec_name,
            "source_name": "Official Company Website",
            "source_type": "OFFICIAL_WEBSITE",
            "official_website": off_url,
            "franchise_information_url": info_url,
            "fetch_status": status,
            "source_mode": mode,
            "data_classification": "MARKETING_CLAIM" if claims_count > 0 else "FACTUAL_DISCLOSURE",
            "last_updated": last_updated_str,
            "observations_count": obs_count,
            "error_message": src.error_message if src else None
        })

    return results

@router.get("/sources/{franchise_id}/observations")
def get_franchise_observations(franchise_id: int, db = Depends(get_db)):
    f_raw = db["franchises"].find_one({"id": franchise_id})
    if not f_raw:
        raise HTTPException(status_code=404, detail="Franchise not found")
    f = wrap_mongo_doc(clean_mongo_doc(f_raw))

    observations = f.observations or []

    obs_list = []
    for idx, o in enumerate(observations[:100], start=1):
        f_at = o.fetched_at
        f_at_str = f_at.strftime("%d %b %Y, %I:%M %p") if hasattr(f_at, "strftime") else (str(f_at) if f_at else "Unknown")
        obs_list.append({
            "id": idx,
            "field_name": o.field_name,
            "original_value": o.original_value,
            "normalized_value": o.normalized_value,
            "currency": getattr(o, "currency", "INR"),
            "source_url": o.source_url,
            "source_domain": getattr(o, "source_domain", ""),
            "source_type": o.source_type,
            "data_classification": o.data_classification,
            "confidence_score": o.confidence_score,
            "fetched_at": f_at_str
        })

    return {
        "franchise_id": f.id,
        "franchise_name": f.name,
        "official_website": f.source_config.official_website if f.source_config else f.website,
        "total_observations": len(observations),
        "observations": obs_list
    }

@router.get("/admin/data-quality-summary")
def get_data_quality_summary(db = Depends(get_db)):
    franchises = list(db["franchises"].find({"is_active": True}))
    total_franchises = len(franchises)

    live_sources_count = 0
    successful_count = 0
    partial_count = 0
    unavailable_count = 0
    total_observations = 0
    marketing_claims_count = 0
    factual_disclosures_count = 0

    for f in franchises:
        src = f.get("source_config") or {}
        if src.get("source_mode") == "LIVE":
            live_sources_count += 1
        status = src.get("fetch_status")
        if status == "SUCCESS":
            successful_count += 1
        elif status == "PARTIAL_SUCCESS":
            partial_count += 1
        elif status in ("UNAVAILABLE", "BLOCKED", "TIMEOUT", "NOT_FOUND"):
            unavailable_count += 1

        obs = f.get("observations") or []
        total_observations += len(obs)
        for o in obs:
            if o.get("data_classification") == "MARKETING_CLAIM":
                marketing_claims_count += 1
            elif o.get("data_classification") == "FACTUAL_DISCLOSURE":
                factual_disclosures_count += 1

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
        "last_refresh": "Current Session",
        "refresh_interval_hours": 24,
        "system_status": "OPERATIONAL"
    }
