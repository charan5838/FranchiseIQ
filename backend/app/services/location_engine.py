from typing import Dict, Any, List

def evaluate_location_intelligence(
    city: str,
    locality: str,
    pin_code: str,
    shop_area_sqft: float,
    monthly_rent: float,
    footfall_estimate: int,
    competitors_list: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # 1. Rent efficiency: rent per sqft
    rent_per_sqft = monthly_rent / shop_area_sqft if shop_area_sqft > 0 else 120.0
    # benchmark: ₹80 - ₹160 / sqft in tier-1 prime high street
    if rent_per_sqft <= 90:
        rent_eff_score = 92.0
    elif rent_per_sqft <= 140:
        rent_eff_score = 80.0
    elif rent_per_sqft <= 200:
        rent_eff_score = 62.0
    else:
        rent_eff_score = 45.0

    # 2. Footfall score (daily footfall)
    # 500 = 50, 1500 = 85, 2500+ = 98
    footfall_score = min(98.0, max(40.0, (footfall_estimate / 2000.0) * 85.0 + 15.0))

    # 3. Competition & Saturation
    num_competitors = len(competitors_list)
    avg_distance = (
        sum(c.get("distance_km", 1.0) for c in competitors_list) / num_competitors
        if num_competitors > 0 else 2.5
    )

    if num_competitors <= 2:
        comp_intensity = "Low"
        comp_badge = "emerald"
        competition_score = 88.0
        saturation_score = 35.0  # low saturation is good
    elif num_competitors <= 5:
        comp_intensity = "Medium"
        comp_badge = "amber"
        competition_score = 68.0
        saturation_score = 60.0
    else:
        comp_intensity = "High"
        comp_badge = "red"
        competition_score = 45.0
        saturation_score = 85.0

    # 4. Local Demand Score (derived from footfall, rent willingness, commercial activity)
    demand_score = round(min(98.0, (footfall_score * 0.6) + (rent_eff_score * 0.4) + 5.0), 1)

    # 5. Overall Location Score (0-100)
    overall_location_score = round(
        (demand_score * 0.35) +
        (competition_score * 0.25) +
        (rent_eff_score * 0.20) +
        (footfall_score * 0.20),
        1
    )

    return {
        "city": city,
        "locality": locality,
        "pin_code": pin_code,
        "rent_per_sqft": round(rent_per_sqft, 1),
        "demand_score": demand_score,
        "competition_score": competition_score,
        "rent_efficiency_score": rent_eff_score,
        "footfall_score": round(footfall_score, 1),
        "market_saturation_score": saturation_score,
        "overall_location_score": overall_location_score,
        "competitor_count": num_competitors,
        "avg_competitor_distance_km": round(avg_distance, 1),
        "competitive_intensity": comp_intensity,
        "comp_badge": comp_badge,
        "competitors": competitors_list
    }
