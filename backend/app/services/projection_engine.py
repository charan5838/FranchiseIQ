from typing import Dict, Any, List

def generate_multi_year_projections(
    current_annual_revenue: float,
    current_annual_expenses: float,
    current_outlets: int,
    total_investment: float,
    expansion_rate_pct: float = 15.0
) -> Dict[str, List[Dict[str, Any]]]:
    scenarios_def = {
        "Conservative": {
            "rev_growth": max(0.03, (expansion_rate_pct / 100.0) * 0.4),
            "expense_growth": 0.08,
            "outlet_growth": 0.05
        },
        "Expected": {
            "rev_growth": max(0.08, (expansion_rate_pct / 100.0) * 0.8),
            "expense_growth": 0.05,
            "outlet_growth": expansion_rate_pct / 100.0
        },
        "Optimistic": {
            "rev_growth": max(0.14, (expansion_rate_pct / 100.0) * 1.2),
            "expense_growth": 0.04,
            "outlet_growth": (expansion_rate_pct / 100.0) * 1.3
        }
    }

    result: Dict[str, List[Dict[str, Any]]] = {}

    for scen_name, rates in scenarios_def.items():
        timeframes = []
        rev = current_annual_revenue
        exp = current_annual_expenses
        outlets = current_outlets

        for year in [1, 3, 5]:
            # Compound for the year
            for _ in range(year if year == 1 else (2 if year == 3 else 2)):
                rev *= (1.0 + rates["rev_growth"])
                exp *= (1.0 + rates["expense_growth"])
                outlets = int(outlets * (1.0 + rates["outlet_growth"]))

            profit = rev - exp
            roi = (profit / total_investment * 100.0) if total_investment > 0 else 0.0
            payback = (total_investment / (profit / 12.0)) if profit > 0 else 999.0

            timeframes.append({
                "timeframe_years": year,
                "projected_annual_revenue": round(rev, 2),
                "projected_annual_expenses": round(exp, 2),
                "projected_annual_profit": round(profit, 2),
                "projected_roi": round(roi, 1),
                "projected_payback_months": round(payback, 1),
                "projected_total_outlets": outlets,
                "disclaimer": "MODEL ESTIMATE — NOT GUARANTEED"
            })
        result[scen_name] = timeframes

    return result
