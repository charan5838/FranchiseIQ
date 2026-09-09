from typing import Dict, Any

def analyze_claim_gap(
    claimed_monthly_revenue: float,
    actual_monthly_revenue: float,
    claimed_net_margin: float,
    actual_net_margin: float,
    claimed_monthly_profit: float,
    actual_monthly_profit: float
) -> Dict[str, Any]:
    revenue_gap = claimed_monthly_revenue - actual_monthly_revenue
    revenue_gap_pct = (revenue_gap / claimed_monthly_revenue * 100.0) if claimed_monthly_revenue > 0 else 0.0

    margin_gap = claimed_net_margin - actual_net_margin
    margin_gap_pct = (margin_gap / claimed_net_margin * 100.0) if claimed_net_margin > 0 else 0.0

    profit_gap = claimed_monthly_profit - actual_monthly_profit
    profit_gap_pct = (profit_gap / claimed_monthly_profit * 100.0) if claimed_monthly_profit > 0 else 0.0

    # Severity evaluation
    if profit_gap_pct > 30.0 or revenue_gap_pct > 25.0:
        severity = "HIGH"
        badge_color = "red"
        status_label = "Suspiciously High Gap"
        advisory = (
            f"Caution: The franchisor advertises monthly profit of ₹{claimed_monthly_profit:,.0f}, "
            f"whereas verified/reported field operations average ₹{actual_monthly_profit:,.0f} "
            f"({profit_gap_pct:.1f}% lower). Claimed margins appear aggressively optimistic."
        )
    elif profit_gap_pct > 15.0 or revenue_gap_pct > 12.0:
        severity = "MODERATE"
        badge_color = "amber"
        status_label = "Moderate Marketing Gap"
        advisory = (
            f"Notice: Advertised figures are ~{profit_gap_pct:.1f}% above verified real-world averages. "
            "Franchisor assumptions may represent prime location best-case scenarios."
        )
    else:
        severity = "LOW"
        badge_color = "emerald"
        status_label = "Close Alignment"
        advisory = (
            "Verified field operations closely align with franchisor promotional disclosures "
            f"(discrepancy under {max(profit_gap_pct, 0):.1f}%)."
        )

    return {
        "claimed_monthly_revenue": claimed_monthly_revenue,
        "actual_monthly_revenue": actual_monthly_revenue,
        "revenue_gap": round(revenue_gap, 2),
        "revenue_gap_pct": round(revenue_gap_pct, 1),
        "claimed_net_margin": claimed_net_margin,
        "actual_net_margin": actual_net_margin,
        "margin_gap": round(margin_gap, 2),
        "margin_gap_pct": round(margin_gap_pct, 1),
        "claimed_monthly_profit": claimed_monthly_profit,
        "actual_monthly_profit": actual_monthly_profit,
        "profit_gap": round(profit_gap, 2),
        "profit_gap_pct": round(profit_gap_pct, 1),
        "severity": severity,
        "badge_color": badge_color,
        "status_label": status_label,
        "advisory": advisory
    }
