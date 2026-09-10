from typing import Dict, Any, List

def calculate_monthly_revenue(avg_customers_daily: float, avg_ticket_value: float, operating_days: int = 30) -> float:
    return float(avg_customers_daily * avg_ticket_value * operating_days)

def calculate_franchise_pnl(
    revenue: float,
    cogs_pct: float,
    rent: float,
    salaries: float,
    utilities: float,
    marketing: float,
    maintenance: float,
    platform_commission: float,
    tech_fees: float,
    other_expenses: float,
    royalty_pct: float,
    royalty_fixed: float,
    total_investment: float,
    tax_pct: float = 0.0
) -> Dict[str, Any]:
    # Gross Profit
    cogs_amount = revenue * (cogs_pct / 100.0)
    gross_profit = revenue - cogs_amount
    gross_margin_pct = (gross_profit / revenue * 100.0) if revenue > 0 else 0.0

    # Royalty calculation
    royalty_amount = (revenue * (royalty_pct / 100.0)) + royalty_fixed

    # Operating Expenses (ex-royalty)
    operating_expenses = (
        salaries + rent + utilities + marketing +
        maintenance + platform_commission + tech_fees + other_expenses
    )

    # Operating Profit
    operating_profit = gross_profit - operating_expenses
    operating_margin_pct = (operating_profit / revenue * 100.0) if revenue > 0 else 0.0

    # Net Profit (after royalties and tax)
    profit_before_tax = operating_profit - royalty_amount
    tax_amount = max(0.0, profit_before_tax * (tax_pct / 100.0))
    monthly_net_profit = profit_before_tax - tax_amount
    net_margin_pct = (monthly_net_profit / revenue * 100.0) if revenue > 0 else 0.0

    annual_net_profit = monthly_net_profit * 12.0
    roi_annual = (annual_net_profit / total_investment * 100.0) if total_investment > 0 else 0.0
    payback_months = (total_investment / monthly_net_profit) if monthly_net_profit > 0 else 999.0

    # Fixed vs Variable Cost Breakdown for Break-Even Analysis
    fixed_costs = rent + salaries + (utilities * 0.5) + tech_fees + royalty_fixed + (maintenance * 0.7)
    variable_costs = cogs_amount + (revenue * (royalty_pct / 100.0)) + platform_commission + (utilities * 0.5) + marketing + (maintenance * 0.3) + other_expenses

    variable_cost_ratio = (variable_costs / revenue) if revenue > 0 else 0.5
    contribution_margin_ratio = max(0.05, 1.0 - variable_cost_ratio)
    break_even_monthly_sales = fixed_costs / contribution_margin_ratio if contribution_margin_ratio > 0 else 0.0

    return {
        "revenue": round(revenue, 2),
        "cogs_amount": round(cogs_amount, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_margin_pct": round(gross_margin_pct, 1),
        "operating_expenses": round(operating_expenses, 2),
        "royalty_amount": round(royalty_amount, 2),
        "total_expenses": round(cogs_amount + operating_expenses + royalty_amount, 2),
        "operating_profit": round(operating_profit, 2),
        "operating_margin_pct": round(operating_margin_pct, 1),
        "monthly_net_profit": round(monthly_net_profit, 2),
        "annual_net_profit": round(annual_net_profit, 2),
        "net_margin_pct": round(net_margin_pct, 1),
        "roi_annual": round(roi_annual, 1),
        "payback_months": round(payback_months, 1),
        "fixed_costs": round(fixed_costs, 2),
        "variable_costs": round(variable_costs, 2),
        "contribution_margin_ratio": round(contribution_margin_ratio, 3),
        "break_even_monthly_sales": round(break_even_monthly_sales, 2)
    }

def generate_break_even_chart_data(fixed_costs: float, variable_cost_ratio: float, current_revenue: float) -> List[Dict[str, Any]]:
    points = []
    max_rev = max(current_revenue * 1.5, fixed_costs * 2.0, 100000.0)
    step = max_rev / 10.0
    for i in range(11):
        rev = step * i
        total_costs = fixed_costs + (rev * variable_cost_ratio)
        points.append({
            "revenue": round(rev, 0),
            "total_costs": round(total_costs, 0),
            "fixed_costs": round(fixed_costs, 0),
            "profit": round(rev - total_costs, 0)
        })
    return points

SECTOR_TICKET_BENCHMARKS: Dict[str, float] = {
    "QSR": 280.0,
    "Food & Beverage": 750.0,
    "Cafes": 320.0,
    "Healthcare": 550.0,
    "Diagnostics": 1200.0,
    "Fitness": 2800.0,
    "Education": 5500.0,
    "Logistics": 85.0,
    "Retail": 1400.0,
    "Beauty & Salon": 950.0,
    "EV & Automotive": 2400.0,
    "Home Services": 8500.0,
}

def build_franchise_calculator_preset(f) -> Dict[str, Any]:
    sec_name = f.sector.name if f.sector else "QSR"
    ticket_val = SECTOR_TICKET_BENCHMARKS.get(sec_name, 350.0)
    
    fin = f.financial
    ops = f.operating_costs
    fees = f.fees
    inv = f.investment

    claimed_rev = fin.claimed_monthly_revenue if fin else 600000.0
    actual_rev = fin.actual_monthly_revenue if fin else 500000.0
    claimed_prof = fin.claimed_monthly_profit if fin else 120000.0
    actual_prof = fin.actual_monthly_profit if fin else 90000.0
    claimed_margin = fin.claimed_net_margin if fin else 20.0
    actual_margin = fin.actual_net_margin if fin else 15.0
    tot_inv = inv.total_estimated_investment if inv else 2500000.0
    fee = inv.franchise_fee if inv else 400000.0

    claimed_customers = max(1, round(claimed_rev / (ticket_val * 30)))
    actual_customers = max(1, round(actual_rev / (ticket_val * 30)))

    cogs_pct = (ops.raw_materials_cogs / actual_rev * 100.0) if (ops and actual_rev > 0) else (100.0 - fin.gross_margin if fin else 35.0)
    rent = ops.monthly_rent if ops else 65000.0
    salaries = ops.employee_salaries if ops else 60000.0
    utilities = ops.utilities if ops else 20000.0
    marketing = ops.marketing if ops else 15000.0
    maintenance = ops.maintenance if ops else 10000.0
    platform_comm = ops.platform_delivery_commission if ops else 20000.0
    tech_fees = ops.technology_software if ops else 5000.0
    other_expenses = ops.other_operating_expenses if ops else 10000.0
    royalty_pct = fees.royalty_percentage if fees else 5.0
    royalty_fixed = fees.royalty_fixed if fees else 0.0

    # Claim gap analysis
    rev_gap = claimed_rev - actual_rev
    rev_gap_pct = round((rev_gap / actual_rev * 100.0), 1) if actual_rev > 0 else 0.0
    prof_gap = claimed_prof - actual_prof
    prof_gap_pct = round((prof_gap / actual_prof * 100.0), 1) if actual_prof > 0 else 0.0

    severity = "LOW"
    if prof_gap_pct > 35:
        severity = "CRITICAL"
    elif prof_gap_pct > 22:
        severity = "HIGH"
    elif prof_gap_pct > 10:
        severity = "MODERATE"

    # Historical trends
    history = []
    if f.historical_financials:
        for h in f.historical_financials:
            history.append({
                "year": h.year,
                "annual_revenue": h.annual_revenue,
                "annual_profit": h.annual_profit,
                "annual_expenses": h.annual_expenses,
                "total_investment": h.total_investment,
                "roi_annual": h.roi_annual,
                "total_outlets": h.total_outlets,
                "closure_rate": h.closure_rate
            })

    return {
        "id": f.id,
        "name": f.name,
        "slug": f.slug,
        "sector_id": f.sector_id,
        "sector_name": sec_name,
        "sub_sector": f.sub_sector,
        "logo_url": f.logo_url,
        "total_investment": tot_inv,
        "franchise_fee": fee,
        "space_min_sqft": f.space_min_sqft,
        "space_max_sqft": f.space_max_sqft,
        "ticket_value": ticket_val,
        "claimed_data": {
            "monthly_revenue": claimed_rev,
            "monthly_profit": claimed_prof,
            "net_margin_pct": claimed_margin,
            "annual_revenue": fin.claimed_annual_revenue if fin else claimed_rev * 12,
            "annual_profit": fin.claimed_annual_profit if fin else claimed_prof * 12,
            "roi_annual": round((claimed_prof * 12 / tot_inv * 100.0), 1) if tot_inv > 0 else 0.0,
            "payback_months": round(tot_inv / claimed_prof, 1) if claimed_prof > 0 else 999.0,
            "customers_daily": claimed_customers,
        },
        "actual_data": {
            "monthly_revenue": actual_rev,
            "monthly_profit": actual_prof,
            "net_margin_pct": actual_margin,
            "annual_revenue": fin.actual_annual_revenue if fin else actual_rev * 12,
            "annual_profit": fin.actual_annual_profit if fin else actual_prof * 12,
            "roi_annual": fin.roi_annual if fin else 25.0,
            "payback_months": fin.payback_months if fin else 24.0,
            "customers_daily": actual_customers,
        },
        "operating_costs": {
            "cogs_pct": round(cogs_pct, 1),
            "monthly_rent": rent,
            "employee_salaries": salaries,
            "utilities": utilities,
            "marketing": marketing,
            "maintenance": maintenance,
            "platform_commission": platform_comm,
            "tech_fees": tech_fees,
            "other_expenses": other_expenses,
            "royalty_pct": royalty_pct,
            "royalty_fixed": royalty_fixed
        },
        "claim_gap": {
            "revenue_gap": rev_gap,
            "revenue_gap_pct": rev_gap_pct,
            "profit_gap": prof_gap,
            "profit_gap_pct": prof_gap_pct,
            "severity": severity
        },
        "history": history
    }
