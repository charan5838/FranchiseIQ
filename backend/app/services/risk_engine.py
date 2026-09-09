from typing import Dict, Any, List

def calculate_risk_score(
    total_investment: float,
    royalty_pct: float,
    closure_rate_pct: float,
    brand_age_years: int,
    expansion_rate_pct: float,
    data_confidence_score: float,
    competitor_density: float = 3.5,
    revenue_volatility_pct: float = 12.0
) -> Dict[str, Any]:
    risk_points = 0.0
    risk_factors: List[Dict[str, Any]] = []

    # 1. Capital at risk (0-20 pts)
    if total_investment > 5000000:
        inv_pts = 18.0
        risk_factors.append({"factor": "High Capital Requirement", "detail": f"Investment of ₹{total_investment/100000:.1f}L requires significant liquidity", "risk": "High"})
    elif total_investment > 2500000:
        inv_pts = 12.0
        risk_factors.append({"factor": "Moderate Capital", "detail": f"Investment of ₹{total_investment/100000:.1f}L is standard for mid-tier retail/QSR", "risk": "Medium"})
    else:
        inv_pts = 6.0
        risk_factors.append({"factor": "Low Capital Exposure", "detail": f"Accessible entry capital of ₹{total_investment/100000:.1f}L lowers financial risk", "risk": "Low"})
    risk_points += inv_pts

    # 2. Royalty burden (0-15 pts)
    if royalty_pct >= 8.0:
        roy_pts = 14.0
        risk_factors.append({"factor": "Heavy Royalty Drag", "detail": f"{royalty_pct}% royalty on gross sales compresses operating margins", "risk": "High"})
    elif royalty_pct >= 5.0:
        roy_pts = 9.0
        risk_factors.append({"factor": "Standard Royalty", "detail": f"{royalty_pct}% royalty is in line with industry benchmarks", "risk": "Medium"})
    else:
        roy_pts = 4.0
        risk_factors.append({"factor": "Favorable Royalty", "detail": f"Low {royalty_pct}% royalty preserves net operator cash flow", "risk": "Low"})
    risk_points += roy_pts

    # 3. Outlet Closure rate (0-25 pts)
    if closure_rate_pct >= 6.0:
        cls_pts = 24.0
        risk_factors.append({"factor": "Elevated Outlet Churn", "detail": f"{closure_rate_pct:.1f}% annual outlet failure rate indicates franchisee distress", "risk": "High"})
    elif closure_rate_pct >= 3.0:
        cls_pts = 14.0
        risk_factors.append({"factor": "Moderate Outlet Churn", "detail": f"{closure_rate_pct:.1f}% closure rate reflects normal retail turnover", "risk": "Medium"})
    else:
        cls_pts = 5.0
        risk_factors.append({"factor": "Exceptional Outlet Retention", "detail": f"Very low closure rate ({closure_rate_pct:.1f}%) demonstrates high franchisee survival", "risk": "Low"})
    risk_points += cls_pts

    # 4. Brand Maturity & Longevity (0-15 pts)
    if brand_age_years < 3:
        age_pts = 14.0
        risk_factors.append({"factor": "Nascent Brand", "detail": "Less than 3 years in operation; business model still unproven in downturns", "risk": "High"})
    elif brand_age_years < 7:
        age_pts = 8.0
        risk_factors.append({"factor": "Growth-Stage Brand", "detail": f"{brand_age_years} years operating history with expanding brand recognition", "risk": "Medium"})
    else:
        age_pts = 3.0
        risk_factors.append({"factor": "Mature Market Leader", "detail": f"{brand_age_years}+ years established track record with recognized consumer trust", "risk": "Low"})
    risk_points += age_pts

    # 5. Competition & Market Density (0-15 pts)
    if competitor_density > 6.0:
        comp_pts = 14.0
        risk_factors.append({"factor": "Crowded Category", "detail": "High competitor density elevates customer acquisition cost and pricing pressure", "risk": "High"})
    elif competitor_density > 3.0:
        comp_pts = 8.0
        risk_factors.append({"factor": "Competitive Landscape", "detail": "Moderate presence of peer franchises in prime trade catchments", "risk": "Medium"})
    else:
        comp_pts = 3.0
        risk_factors.append({"factor": "Defensible Niche", "detail": "Low direct substitute density in current catchment zone", "risk": "Low"})
    risk_points += comp_pts

    # 6. Data Transparency / Reliability Discount (0-10 pts)
    data_gap = max(0.0, 100.0 - data_confidence_score)
    data_pts = min(10.0, data_gap * 0.1)
    if data_confidence_score < 75.0:
        risk_factors.append({"factor": "Limited Audited Disclosures", "detail": f"Confidence score {data_confidence_score:.0f}%; numbers rely partially on self-reported estimates", "risk": "Medium"})
    risk_points += data_pts

    total_score = min(100.0, max(5.0, risk_points))

    if total_score <= 35.0:
        risk_tier = "Low Risk"
        badge_color = "emerald"
    elif total_score <= 65.0:
        risk_tier = "Medium Risk"
        badge_color = "amber"
    else:
        risk_tier = "High Risk"
        badge_color = "red"

    return {
        "risk_score": round(total_score, 1),
        "risk_tier": risk_tier,
        "badge_color": badge_color,
        "factors": risk_factors,
        "summary": f"Risk Score: {total_score:.0f}/100 — {risk_tier}"
    }
