from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class RecommendationRequest(BaseModel):
    budget: float = 2500000.0  # ₹25 Lakhs
    city: str = "Hyderabad"
    locality: str = "Madhapur"
    preferred_sector_id: Optional[int] = None
    shop_area_sqft: float = 800.0
    business_experience: str = "0-2 years"
    desired_involvement: str = "full-time"
    risk_preference: str = "Medium"
    desired_return_pct: float = 25.0
    max_payback_months: int = 30
    goal: str = "Maximum ROI"  # "Maximum ROI", "Lowest Risk", "Fastest Payback", "Lowest Investment", "Highest Profit", "Highest Growth", "Best Overall"

class RankedFranchiseOut(BaseModel):
    rank: int
    franchise_id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    sector_name: str
    sub_sector: str
    total_investment: float
    monthly_revenue: float
    monthly_profit: float
    roi_annual: float
    payback_months: float
    risk_score: float
    risk_tier: str
    location_score: float
    overall_score: float
    data_confidence: float
    primary_source_type: str
    score_breakdown: Dict[str, float]
    budget_assessment: str
    space_assessment: str
    why_recommended: List[str]
    key_risks: List[str]
    claim_gap_severity: str

class CalculatorRequest(BaseModel):
    franchise_id: Optional[int] = None
    avg_customers_daily: float = 120.0
    avg_ticket_value: float = 350.0
    operating_days: int = 30
    cogs_pct: float = 35.0
    monthly_rent: float = 65000.0
    employee_salaries: float = 60000.0
    utilities: float = 20000.0
    marketing: float = 15000.0
    maintenance: float = 10000.0
    platform_commission: float = 20000.0
    tech_fees: float = 5000.0
    other_expenses: float = 10000.0
    royalty_pct: float = 5.0
    royalty_fixed: float = 0.0
    total_investment: float = 2500000.0

class CalculatorOut(BaseModel):
    revenue: float
    cogs_amount: float
    gross_profit: float
    gross_margin_pct: float
    operating_expenses: float
    royalty_amount: float
    total_expenses: float
    operating_profit: float
    operating_margin_pct: float
    monthly_net_profit: float
    annual_net_profit: float
    net_margin_pct: float
    roi_annual: float
    payback_months: float
    fixed_costs: float
    variable_costs: float
    contribution_margin_ratio: float
    break_even_monthly_sales: float
    break_even_chart: List[Dict[str, Any]]

class ScenarioSimRequest(BaseModel):
    franchise_id: int
    sales_delta_pct: float = 0.0
    rent_delta_pct: float = 0.0
    salaries_delta_pct: float = 0.0
    cogs_delta_pct: float = 0.0
    demand_delta_pct: float = 0.0

class ScenarioSimOut(BaseModel):
    base_revenue: float
    simulated_revenue: float
    base_expenses: float
    simulated_expenses: float
    base_profit: float
    simulated_profit: float
    profit_delta_pct: float
    base_roi: float
    simulated_roi: float
    base_payback: float
    simulated_payback: float
    risk_assessment: str
    stress_test_rating: str  # "Resilient", "Moderate Impact", "High Fragility"

class ComparisonRequest(BaseModel):
    franchise_ids: List[int]  # 2 to 5 IDs

class LocationAnalysisRequest(BaseModel):
    city: str = "Hyderabad"
    locality: str = "Madhapur"
    pin_code: str = "500081"
    available_area_sqft: float = 800.0
    monthly_rent: float = 75000.0
    footfall_estimate: int = 1500
    sector_id: Optional[int] = None
