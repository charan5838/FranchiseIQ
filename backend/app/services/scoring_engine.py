from typing import Dict, Any, List

def calculate_personalized_score(
    franchise: Any,
    user_budget: float,
    user_city: str,
    user_locality: str,
    user_area_sqft: float,
    user_risk_pref: str,
    user_desired_return: float,
    user_max_payback: float,
    user_goal: str
) -> Dict[str, Any]:
    inv = franchise.investment
    fin = franchise.financial
    outlets = franchise.outlet_info
    fees = franchise.fees

    total_inv = inv.total_estimated_investment if inv else 3000000.0
    roi = fin.roi_annual if fin else 25.0
    payback = fin.payback_months if fin else 24.0
    closure_rate = outlets.closure_rate_pct if outlets else 2.5
    royalty_pct = fees.royalty_percentage if fees else 5.0
    brand_age = franchise.brand_age_years or 5
    expansion = franchise.expansion_rate or 15.0

    # 1. Budget Fit Assessment
    budget_ratio = total_inv / user_budget if user_budget > 0 else 1.0
    if budget_ratio <= 0.85:
        budget_score = 100.0  # Safe buffer
        budget_notes = f"Comfortably within budget (uses {budget_ratio*100:.0f}% of ₹{user_budget/100000:.1f}L)"
    elif budget_ratio <= 1.0:
        budget_score = 90.0
        budget_notes = f"Fits directly within budget (uses {budget_ratio*100:.0f}% of ₹{user_budget/100000:.1f}L)"
    elif budget_ratio <= 1.15:
        budget_score = 65.0   # Slight stretch
        budget_notes = f"Requires minor capital stretch (+{(budget_ratio-1)*100:.0f}% over ₹{user_budget/100000:.1f}L)"
    else:
        budget_score = 30.0   # Over budget
        budget_notes = f"Exceeds current budget by +{(budget_ratio-1)*100:.0f}%"

    # 2. Area/Space Fit Assessment
    min_space = franchise.space_min_sqft or 500.0
    max_space = franchise.space_max_sqft or 1500.0
    if user_area_sqft >= min_space and user_area_sqft <= max_space * 1.5:
        space_score = 95.0
        space_notes = f"Ideal space match: {user_area_sqft:.0f} sq ft fits optimal footprint ({min_space:.0f}-{max_space:.0f} sq ft)"
    elif user_area_sqft < min_space:
        shortfall = min_space - user_area_sqft
        space_score = max(20.0, 90.0 - (shortfall / min_space * 70.0))
        space_notes = f"Area shortfall: Available {user_area_sqft:.0f} sq ft is below required {min_space:.0f} sq ft"
    else:
        space_score = 80.0
        space_notes = f"Surplus area: {user_area_sqft:.0f} sq ft exceeds max {max_space:.0f} sq ft (extra rent burden)"

    # 3. ROI Component (0-100 normalized)
    # 40%+ ROI = 100, 15% ROI = 40
    roi_score = min(100.0, max(20.0, (roi / 40.0) * 100.0))
    if user_desired_return > 0 and roi >= user_desired_return:
        roi_score = min(100.0, roi_score + 10.0)

    # 4. Payback Component (0-100 normalized)
    # 12 months = 100, 36 months = 40
    payback_score = max(15.0, min(100.0, 100.0 - ((payback - 12.0) / 24.0 * 60.0)))
    if user_max_payback > 0 and payback <= user_max_payback:
        payback_score = min(100.0, payback_score + 10.0)

    # 5. Growth & Stability Component (0-100)
    growth_score = min(100.0, max(30.0, (expansion * 2.5) + (brand_age * 4.0) - (closure_rate * 5.0)))

    # 6. Location Component (fetch if analyzed, else default to realistic 78.0)
    location_score = 78.0
    if hasattr(franchise, 'location_analyses') and franchise.location_analyses:
        location_score = franchise.location_analyses[0].overall_location_score

    # 7. Risk Component (Lower risk score = higher suitability)
    # Inverted risk points for ranking
    closure_penalty = min(30.0, closure_rate * 4.0)
    royalty_penalty = min(20.0, royalty_pct * 2.5)
    risk_metric = min(100.0, max(10.0, closure_penalty + royalty_penalty + (100.0 - budget_score)*0.3))
    risk_score_component = 100.0 - risk_metric

    # 8. Data Confidence Component
    data_confidence = 85.0
    if hasattr(franchise, 'data_sources') and franchise.data_sources:
        data_confidence = sum(ds.confidence_level for ds in franchise.data_sources) / len(franchise.data_sources)

    # Goal Weight Profiles
    weights = {
        "Maximum ROI": {"roi": 0.30, "payback": 0.20, "budget": 0.15, "location": 0.15, "growth": 0.10, "risk": 0.05, "data": 0.05},
        "Lowest Risk": {"roi": 0.10, "payback": 0.15, "budget": 0.20, "location": 0.15, "growth": 0.10, "risk": 0.20, "data": 0.10},
        "Fastest Payback": {"roi": 0.15, "payback": 0.35, "budget": 0.15, "location": 0.15, "growth": 0.10, "risk": 0.05, "data": 0.05},
        "Lowest Investment": {"roi": 0.15, "payback": 0.15, "budget": 0.35, "location": 0.15, "growth": 0.10, "risk": 0.05, "data": 0.05},
        "Highest Profit": {"roi": 0.25, "payback": 0.20, "budget": 0.15, "location": 0.15, "growth": 0.15, "risk": 0.05, "data": 0.05},
        "Highest Growth": {"roi": 0.15, "payback": 0.15, "budget": 0.15, "location": 0.15, "growth": 0.30, "risk": 0.05, "data": 0.05},
        "Best Overall": {"roi": 0.20, "payback": 0.20, "budget": 0.15, "location": 0.15, "growth": 0.15, "risk": 0.10, "data": 0.05}
    }
    w = weights.get(user_goal, weights["Best Overall"])

    # Composite Score calculation (0-100)
    composite_raw = (
        (roi_score * w["roi"]) +
        (payback_score * w["payback"]) +
        (budget_score * w["budget"]) +
        (location_score * w["location"]) +
        (growth_score * w["growth"]) +
        (risk_score_component * w["risk"]) +
        (data_confidence * w["data"])
    )
    # Apply space fit modifier (5% penalty if severe space mismatch)
    if space_score < 60.0:
        composite_raw *= 0.90

    final_score = round(min(99.0, max(25.0, composite_raw)), 1)

    # Detailed Category Breakdown
    breakdown = {
        "roi_score": round((roi_score / 100.0) * 20.0, 1),              # Out of 20
        "payback_score": round((payback_score / 100.0) * 20.0, 1),      # Out of 20
        "location_score": round((location_score / 100.0) * 20.0, 1),    # Out of 20
        "growth_score": round((growth_score / 100.0) * 15.0, 1),        # Out of 15
        "risk_score": round((risk_score_component / 100.0) * 15.0, 1),  # Out of 15
        "data_confidence": round((data_confidence / 100.0) * 10.0, 1)   # Out of 10
    }

    # Generate Personalized "Why This Franchise Was Ranked" Explanation
    pros: List[str] = []
    risks: List[str] = []

    if budget_ratio <= 1.0:
        pros.append(f"Fits your ₹{user_budget/100000:.1f}L budget requirement (requires ~₹{total_inv/100000:.1f}L)")
    if payback <= (user_max_payback or 30):
        pros.append(f"Fast payback period of {payback:.0f} months (within your {user_max_payback or 30}-month target)")
    if roi >= 28.0:
        pros.append(f"Strong annual return on investment ({roi:.1f}% ROI)")
    if royalty_pct <= 5.0:
        pros.append(f"Favorable {royalty_pct}% royalty structure preserves operator margins")
    if closure_rate < 3.0:
        pros.append(f"Very low outlet closure rate ({closure_rate:.1f}%) demonstrates franchise network stability")
    if brand_age >= 6:
        pros.append(f"Established market brand with {brand_age}+ years of operational maturity")
    if location_score >= 75.0:
        pros.append(f"High location suitability score ({location_score:.0f}/100) in {user_locality}, {user_city}")

    # Negative Factors & Risks (Transparent disclosure)
    if budget_ratio > 1.0:
        risks.append(f"Budget stretch: Investment of ₹{total_inv/100000:.1f}L exceeds initial capital by {(budget_ratio-1)*100:.0f}%")
    if closure_rate >= 4.0:
        risks.append(f"Outlet closure rate is {closure_rate:.1f}%; indicates franchisee churn in non-prime locations")
    if royalty_pct >= 7.0:
        risks.append(f"High {royalty_pct}% gross sales royalty reduces cash flow cushion during seasonal lulls")
    if space_score < 70.0:
        risks.append(f"Shop size mismatch: requires {min_space:.0f}-{max_space:.0f} sq ft vs your {user_area_sqft:.0f} sq ft")
    risks.append("Rent sensitivity: profit margins depend significantly on local lease renegotiations")
    risks.append("Raw material / supply inflation can temporarily compress quarterly unit economics")

    return {
        "overall_score": final_score,
        "score_breakdown": breakdown,
        "budget_assessment": budget_notes,
        "space_assessment": space_notes,
        "why_recommended": pros,
        "key_risks": risks
    }
