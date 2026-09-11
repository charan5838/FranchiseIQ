from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SectorOut(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    icon: str
    is_active: bool

    class Config:
        from_attributes = True

class FranchiseInvestmentOut(BaseModel):
    min_investment: float
    max_investment: float
    franchise_fee: float
    security_deposit: float
    setup_cost: float
    equipment_cost: float
    interior_cost: float
    technology_cost: float
    initial_inventory: float
    working_capital: float
    other_initial_expenses: float
    total_estimated_investment: float
    last_updated: str

    class Config:
        from_attributes = True

class FranchiseFinancialOut(BaseModel):
    claimed_monthly_revenue: float
    actual_monthly_revenue: float
    claimed_annual_revenue: float
    actual_annual_revenue: float
    gross_margin: float
    operating_margin: float
    claimed_net_margin: float
    actual_net_margin: float
    claimed_monthly_profit: float
    actual_monthly_profit: float
    claimed_annual_profit: float
    actual_annual_profit: float
    break_even_months: int
    roi_annual: float
    roic: Optional[float] = None
    payback_months: float
    revenue_stability_score: float
    profit_stability_score: float
    last_updated: str

    class Config:
        from_attributes = True

class OperatingCostOut(BaseModel):
    monthly_rent: float
    employee_salaries: float
    utilities: float
    raw_materials_cogs: float
    inventory: float
    packaging: float
    maintenance: float
    marketing: float
    platform_delivery_commission: float
    insurance: float
    technology_software: float
    other_operating_expenses: float
    total_monthly_expenses: float

    class Config:
        from_attributes = True

class FranchiseFeeOut(BaseModel):
    royalty_percentage: float
    royalty_fixed: float
    marketing_fee_percentage: float
    technology_fee: float
    renewal_fee: float
    other_recurring_fees: float

    class Config:
        from_attributes = True

class HistoricalFinancialOut(BaseModel):
    year: int
    total_investment: float
    franchise_fee: float
    annual_revenue: float
    annual_expenses: float
    annual_profit: float
    roi_annual: float
    royalty_percentage: float
    marketing_fee_percentage: float
    total_outlets: int
    outlet_openings: int
    outlet_closures: int
    closure_rate: float

    class Config:
        from_attributes = True

class DataSourceOut(BaseModel):
    id: int
    metric_name: str
    source_type: str  # VERIFIED, REPORTED, ESTIMATED, MARKETING_CLAIM
    source_name: str
    methodology: str
    confidence_level: float
    verification_date: str
    verified_by: str

    class Config:
        from_attributes = True

class FranchisorSupportOut(BaseModel):
    training: bool
    store_setup_assistance: bool
    marketing_support: bool
    technology_stack: bool
    supply_chain_logistics: bool
    staff_training: bool
    location_site_selection: bool
    launch_support: bool
    operations_manual_sop: bool
    business_consulting: bool
    branding_assets: bool
    crm_provided: bool
    pos_billing_software: bool
    digital_marketing_leads: bool

    class Config:
        from_attributes = True

class OutletInfoOut(BaseModel):
    total_outlets: int
    company_owned: int
    franchise_owned: int
    active_outlets: int
    closed_outlets: int
    closure_rate_pct: float

    class Config:
        from_attributes = True

class ReviewOut(BaseModel):
    id: int
    user_name: str
    rating: float
    title: str
    comment: str
    created_at: Any

class FranchiseSummary(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    sector_id: int
    sector_name: str
    sub_sector: str
    founded_year: int
    headquarters: str
    franchise_model: str
    space_min_sqft: float
    space_max_sqft: float
    expansion_rate: float
    brand_age_years: int
    total_investment: float
    franchise_fee: float
    monthly_revenue: float
    monthly_profit: float
    roi_annual: float
    payback_months: float
    total_outlets: int
    closure_rate_pct: float
    royalty_pct: float
    risk_score: float
    risk_tier: str
    primary_data_source: str
    data_confidence: float
    claim_gap_severity: str

class FranchiseDetail(FranchiseSummary):
    description: str
    country: str
    website: Optional[str] = None
    availability: str
    investment: FranchiseInvestmentOut
    financial: FranchiseFinancialOut
    operating_costs: OperatingCostOut
    fees: FranchiseFeeOut
    outlet_info: OutletInfoOut
    support: FranchisorSupportOut
    historical_financials: List[HistoricalFinancialOut]
    data_sources: List[DataSourceOut]
    reviews: List[ReviewOut]
    claim_gap_analysis: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    projections: Dict[str, Any]
    franchisee_satisfaction_score: float
    deal_attractiveness_score: float
    source_status: Optional[str] = "DEMO"
    source_mode: Optional[str] = "DEMO"
    official_website: Optional[str] = None
    franchise_information_url: Optional[str] = None
    last_fetched_at: Optional[str] = None
    observations: Optional[List[Dict[str, Any]]] = []
