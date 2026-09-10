from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.franchise import Franchise, Sector
from app.schemas.analysis import (
    CalculatorRequest, CalculatorOut,
    ScenarioSimRequest, ScenarioSimOut
)
from app.services.financial_calc import (
    calculate_monthly_revenue,
    calculate_franchise_pnl,
    generate_break_even_chart_data,
    build_franchise_calculator_preset
)

router = APIRouter(prefix="/calculator", tags=["Financial Calculator & Simulator"])

@router.get("/franchise-presets")
def get_calculator_presets(
    sector_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Franchise).filter(Franchise.is_active == True)
    if sector_id:
        query = query.filter(Franchise.sector_id == sector_id)
    franchises = query.order_by(Franchise.sector_id, Franchise.name).all()
    return [build_franchise_calculator_preset(f) for f in franchises]

@router.get("/preset/{franchise_id}")
def get_calculator_preset_by_id(
    franchise_id: int,
    db: Session = Depends(get_db)
):
    f = db.query(Franchise).filter(Franchise.id == franchise_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Franchise not found")
    return build_franchise_calculator_preset(f)

@router.post("/calculate", response_model=CalculatorOut)
def run_financial_calculator(
    data: CalculatorRequest,
    db: Session = Depends(get_db)
):
    # Calculate revenue from traffic inputs
    calculated_rev = calculate_monthly_revenue(
        avg_customers_daily=data.avg_customers_daily,
        avg_ticket_value=data.avg_ticket_value,
        operating_days=data.operating_days
    )

    pnl = calculate_franchise_pnl(
        revenue=calculated_rev,
        cogs_pct=data.cogs_pct,
        rent=data.monthly_rent,
        salaries=data.employee_salaries,
        utilities=data.utilities,
        marketing=data.marketing,
        maintenance=data.maintenance,
        platform_commission=data.platform_commission,
        tech_fees=data.tech_fees,
        other_expenses=data.other_expenses,
        royalty_pct=data.royalty_pct,
        royalty_fixed=data.royalty_fixed,
        total_investment=data.total_investment
    )

    chart_points = generate_break_even_chart_data(
        fixed_costs=pnl["fixed_costs"],
        variable_cost_ratio=pnl["variable_costs"] / calculated_rev if calculated_rev > 0 else 0.5,
        current_revenue=calculated_rev
    )

    return CalculatorOut(
        **pnl,
        break_even_chart=chart_points
    )

@router.post("/simulate", response_model=ScenarioSimOut)
def run_scenario_simulation(
    data: ScenarioSimRequest,
    db: Session = Depends(get_db)
):
    f = db.query(Franchise).filter(Franchise.id == data.franchise_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Franchise not found")

    fin = f.financial
    ops = f.operating_costs
    fees = f.fees
    inv = f.investment

    base_rev = fin.actual_monthly_revenue if fin else 500000.0
    base_rent = ops.monthly_rent if ops else 60000.0
    base_salaries = ops.employee_salaries if ops else 50000.0
    base_cogs = ops.raw_materials_cogs if ops else base_rev * 0.35
    other_ops = (ops.total_monthly_expenses - base_rent - base_salaries - base_cogs) if ops else 50000.0
    base_royalty = (base_rev * (fees.royalty_percentage / 100.0)) if fees else base_rev * 0.05
    total_inv = inv.total_estimated_investment if inv else 2500000.0

    base_expenses = base_rent + base_salaries + base_cogs + other_ops + base_royalty
    base_profit = base_rev - base_expenses
    base_roi = (base_profit * 12.0 / total_inv * 100.0) if total_inv > 0 else 0.0
    base_payback = (total_inv / base_profit) if base_profit > 0 else 999.0

    # Apply Deltas
    # Demand delta directly enhances or depresses revenue
    effective_sales_delta = data.sales_delta_pct + data.demand_delta_pct
    sim_rev = base_rev * (1.0 + (effective_sales_delta / 100.0))
    sim_rent = base_rent * (1.0 + (data.rent_delta_pct / 100.0))
    sim_salaries = base_salaries * (1.0 + (data.salaries_delta_pct / 100.0))
    # Variable COGS scales with revenue change AND unit cost change
    sim_cogs = (base_cogs * (sim_rev / base_rev)) * (1.0 + (data.cogs_delta_pct / 100.0)) if base_rev > 0 else base_cogs
    sim_royalty = sim_rev * (fees.royalty_percentage / 100.0) if fees else sim_rev * 0.05

    sim_expenses = sim_rent + sim_salaries + sim_cogs + other_ops + sim_royalty
    sim_profit = sim_rev - sim_expenses
    profit_delta_pct = ((sim_profit - base_profit) / base_profit * 100.0) if base_profit > 0 else -100.0
    sim_roi = (sim_profit * 12.0 / total_inv * 100.0) if total_inv > 0 else 0.0
    sim_payback = (total_inv / sim_profit) if sim_profit > 0 else 999.0

    # Risk Assessment of Stress Test
    if sim_profit <= 0:
        stress_rating = "High Fragility"
        assessment = "Under this stressed scenario, the unit experiences negative cash flow. Working capital would be consumed rapidly."
    elif profit_delta_pct < -35.0:
        stress_rating = "Moderate Impact"
        assessment = f"Operating margins contract significantly by {abs(profit_delta_pct):.1f}%. Payback extends to {sim_payback:.1f} months."
    else:
        stress_rating = "Resilient"
        assessment = f"Business model demonstrates strong cash flow resilience. Unit remains comfortably profitable at ₹{sim_profit:,.0f}/month."

    return ScenarioSimOut(
        base_revenue=round(base_rev, 2),
        simulated_revenue=round(sim_rev, 2),
        base_expenses=round(base_expenses, 2),
        simulated_expenses=round(sim_expenses, 2),
        base_profit=round(base_profit, 2),
        simulated_profit=round(sim_profit, 2),
        profit_delta_pct=round(profit_delta_pct, 1),
        base_roi=round(base_roi, 1),
        simulated_roi=round(sim_roi, 1),
        base_payback=round(base_payback, 1),
        simulated_payback=round(sim_payback, 1),
        risk_assessment=assessment,
        stress_test_rating=stress_rating
    )
