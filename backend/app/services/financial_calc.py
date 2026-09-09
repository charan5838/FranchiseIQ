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
