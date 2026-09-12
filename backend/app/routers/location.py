import re
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
from app.schemas.analysis import LocationAnalysisRequest
from app.services.location_engine import evaluate_location_intelligence

router = APIRouter(prefix="/locations", tags=["Location & Competition Intelligence"])

@router.get("")
def list_locations(db = Depends(get_db)):
    locs = list(db["locations"].find())
    return [
        {
            "id": l["id"],
            "city": l.get("city"),
            "locality": l.get("locality"),
            "pin_code": l.get("pin_code"),
            "tier": l.get("tier"),
            "avg_rent_sqft": l.get("avg_rent_sqft"),
            "footfall_index": l.get("footfall_index"),
            "population_density": l.get("population_density"),
            "commercial_activity_score": l.get("commercial_activity_score")
        }
        for l in locs
    ]

@router.post("/analyze")
def analyze_location(
    data: LocationAnalysisRequest,
    db = Depends(get_db)
):
    loc_query = {
        "city": {"$regex": re.escape(data.city), "$options": "i"},
        "locality": {"$regex": re.escape(data.locality), "$options": "i"}
    }

    loc = db["locations"].find_one(loc_query)

    competitors_data: List[Dict[str, Any]] = []
    if loc and loc.get("competitors"):
        for c in loc["competitors"]:
            competitors_data.append({
                "name": c.get("competitor_name"),
                "category": c.get("category"),
                "distance_km": c.get("distance_km"),
                "density": c.get("competitor_density"),
                "similar_brand": c.get("similar_brand"),
                "competitive_intensity": c.get("competitive_intensity")
            })
    else:
        competitors_data = [
            {"name": "Local Brand Hub", "category": "Direct Competitor", "distance_km": 0.6, "density": 3.2, "similar_brand": "Generic Category Lead", "competitive_intensity": "Medium"},
            {"name": "Metro Express", "category": "Regional Competitor", "distance_km": 1.2, "density": 2.8, "similar_brand": "Value Alternative", "competitive_intensity": "Low"},
            {"name": "Prime Corner Outlet", "category": "High-Street Peer", "distance_km": 0.4, "density": 4.5, "similar_brand": "Premium Chain", "competitive_intensity": "Medium"}
        ]

    result = evaluate_location_intelligence(
        city=data.city,
        locality=data.locality,
        pin_code=data.pin_code,
        shop_area_sqft=data.available_area_sqft,
        monthly_rent=data.monthly_rent,
        footfall_estimate=data.footfall_estimate,
        competitors_list=competitors_data
    )

    return result
