export interface Sector {
  id: number;
  name: string;
  category: string;
  description?: string;
  icon: string;
  is_active: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'investor' | 'admin' | 'host';
  created_at: string;
}

export interface UserPreferences {
  budget: number;
  city: string;
  locality: string;
  preferred_sector_id?: number | null;
  shop_area_sqft: number;
  business_experience: string;
  desired_involvement: string;
  risk_preference: string;
  desired_return_pct: number;
  max_payback_months: number;
  goal: string;
}

export interface FranchiseSummary {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  sector_id: number;
  sector_name: string;
  sub_sector: string;
  founded_year: number;
  headquarters: string;
  franchise_model: string;
  space_min_sqft: number;
  space_max_sqft: number;
  expansion_rate: number;
  brand_age_years: number;
  total_investment: number;
  franchise_fee: number;
  monthly_revenue: number;
  monthly_profit: number;
  roi_annual: number;
  payback_months: number;
  total_outlets: number;
  closure_rate_pct: number;
  royalty_pct: number;
  risk_score: number;
  risk_tier: string;
  primary_data_source: 'VERIFIED' | 'REPORTED' | 'ESTIMATED' | 'MARKETING_CLAIM' | string;
  data_confidence: number;
  claim_gap_severity: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface DataSource {
  id: number;
  metric_name: string;
  source_type: 'VERIFIED' | 'REPORTED' | 'ESTIMATED' | 'MARKETING_CLAIM';
  source_name: string;
  methodology: string;
  confidence_level: number;
  verification_date: string;
  verified_by: string;
}

export interface HistoricalRecord {
  year: number;
  total_investment: number;
  franchise_fee: number;
  annual_revenue: number;
  annual_expenses: number;
  annual_profit: number;
  roi_annual: number;
  royalty_percentage: number;
  marketing_fee_percentage: number;
  total_outlets: number;
  outlet_openings: number;
  outlet_closures: number;
  closure_rate: number;
}

export interface FranchisorSupport {
  training: boolean;
  store_setup_assistance: boolean;
  marketing_support: boolean;
  technology_stack: boolean;
  supply_chain_logistics: boolean;
  staff_training: boolean;
  location_site_selection: boolean;
  launch_support: boolean;
  operations_manual_sop: boolean;
  business_consulting: boolean;
  branding_assets: boolean;
  crm_provided: boolean;
  pos_billing_software: boolean;
  digital_marketing_leads: boolean;
}

export interface FranchiseDetail extends FranchiseSummary {
  description: string;
  country: string;
  website?: string;
  availability: string;
  investment: {
    min_investment: number;
    max_investment: number;
    franchise_fee: number;
    security_deposit: number;
    setup_cost: number;
    equipment_cost: number;
    interior_cost: number;
    technology_cost: number;
    initial_inventory: number;
    working_capital: number;
    other_initial_expenses: number;
    total_estimated_investment: number;
    last_updated: string;
  };
  financial: {
    claimed_monthly_revenue: number;
    actual_monthly_revenue: number;
    claimed_annual_revenue: number;
    actual_annual_revenue: number;
    gross_margin: number;
    operating_margin: number;
    claimed_net_margin: number;
    actual_net_margin: number;
    claimed_monthly_profit: number;
    actual_monthly_profit: number;
    claimed_annual_profit: number;
    actual_annual_profit: number;
    break_even_months: number;
    roi_annual: number;
    roic?: number;
    payback_months: number;
    revenue_stability_score: number;
    profit_stability_score: number;
    last_updated: string;
  };
  operating_costs: {
    monthly_rent: number;
    employee_salaries: number;
    utilities: number;
    raw_materials_cogs: number;
    inventory: number;
    packaging: number;
    maintenance: number;
    marketing: number;
    platform_delivery_commission: number;
    insurance: number;
    technology_software: number;
    other_operating_expenses: number;
    total_monthly_expenses: number;
  };
  fees: {
    royalty_percentage: number;
    royalty_fixed: number;
    marketing_fee_percentage: number;
    technology_fee: number;
    renewal_fee: number;
    other_recurring_fees: number;
  };
  outlet_info: {
    total_outlets: number;
    company_owned: number;
    franchise_owned: number;
    active_outlets: number;
    closed_outlets: number;
    closure_rate_pct: number;
  };
  support: FranchisorSupport;
  historical_financials: HistoricalRecord[];
  data_sources: DataSource[];
  reviews: Array<{
    id: number;
    user_name: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
  }>;
  claim_gap_analysis: {
    claimed_monthly_revenue: number;
    actual_monthly_revenue: number;
    revenue_gap: number;
    revenue_gap_pct: number;
    claimed_net_margin: number;
    actual_net_margin: number;
    margin_gap: number;
    margin_gap_pct: number;
    claimed_monthly_profit: number;
    actual_monthly_profit: number;
    profit_gap: number;
    profit_gap_pct: number;
    severity: 'LOW' | 'MODERATE' | 'HIGH';
    badge_color: string;
    status_label: string;
    advisory: string;
  };
  risk_analysis: {
    risk_score: number;
    risk_tier: string;
    badge_color: string;
    factors: Array<{ factor: string; detail: string; risk: string }>;
    summary: string;
  };
  projections: {
    Conservative: Array<{
      timeframe_years: number;
      projected_annual_revenue: number;
      projected_annual_expenses: number;
      projected_annual_profit: number;
      projected_roi: number;
      projected_payback_months: number;
      projected_total_outlets: number;
      disclaimer: string;
    }>;
    Expected: Array<{
      timeframe_years: number;
      projected_annual_revenue: number;
      projected_annual_expenses: number;
      projected_annual_profit: number;
      projected_roi: number;
      projected_payback_months: number;
      projected_total_outlets: number;
      disclaimer: string;
    }>;
    Optimistic: Array<{
      timeframe_years: number;
      projected_annual_revenue: number;
      projected_annual_expenses: number;
      projected_annual_profit: number;
      projected_roi: number;
      projected_payback_months: number;
      projected_total_outlets: number;
      disclaimer: string;
    }>;
  };
  franchisee_satisfaction_score: number;
  deal_attractiveness_score: number;
}

export interface RankedFranchise {
  rank: number;
  franchise_id: number;
  name: string;
  slug: string;
  logo_url?: string;
  sector_name: string;
  sub_sector: string;
  total_investment: number;
  monthly_revenue: number;
  monthly_profit: number;
  roi_annual: number;
  payback_months: number;
  risk_score: number;
  risk_tier: string;
  location_score: number;
  overall_score: number;
  data_confidence: number;
  primary_source_type: string;
  score_breakdown: {
    roi_score: number;
    payback_score: number;
    location_score: number;
    growth_score: number;
    risk_score: number;
    data_confidence: number;
  };
  budget_assessment: string;
  space_assessment: string;
  why_recommended: string[];
  key_risks: string[];
  claim_gap_severity: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface CalculatorResult {
  revenue: number;
  cogs_amount: number;
  gross_profit: number;
  gross_margin_pct: number;
  operating_expenses: number;
  royalty_amount: number;
  total_expenses: number;
  operating_profit: number;
  operating_margin_pct: number;
  monthly_net_profit: number;
  annual_net_profit: number;
  net_margin_pct: number;
  roi_annual: number;
  payback_months: number;
  fixed_costs: number;
  variable_costs: number;
  contribution_margin_ratio: number;
  break_even_monthly_sales: number;
  break_even_chart: Array<{
    revenue: number;
    total_costs: number;
    fixed_costs: number;
    profit: number;
  }>;
}

export interface FranchiseCalculatorPreset {
  id: number;
  name: string;
  slug: string;
  sector_id: number;
  sector_name: string;
  sub_sector: string;
  logo_url?: string;
  total_investment: number;
  franchise_fee: number;
  space_min_sqft: number;
  space_max_sqft: number;
  ticket_value: number;
  claimed_data: {
    monthly_revenue: number;
    monthly_profit: number;
    net_margin_pct: number;
    annual_revenue: number;
    annual_profit: number;
    roi_annual: number;
    payback_months: number;
    customers_daily: number;
  };
  actual_data: {
    monthly_revenue: number;
    monthly_profit: number;
    net_margin_pct: number;
    annual_revenue: number;
    annual_profit: number;
    roi_annual: number;
    payback_months: number;
    customers_daily: number;
  };
  operating_costs: {
    cogs_pct: number;
    monthly_rent: number;
    employee_salaries: number;
    utilities: number;
    marketing: number;
    maintenance: number;
    platform_commission: number;
    tech_fees: number;
    other_expenses: number;
    royalty_pct: number;
    royalty_fixed: number;
  };
  claim_gap: {
    revenue_gap: number;
    revenue_gap_pct: number;
    profit_gap: number;
    profit_gap_pct: number;
    severity: string;
  };
  history: Array<{
    year: number;
    annual_revenue: number;
    annual_profit: number;
    annual_expenses: number;
    total_investment: number;
    roi_annual: number;
    total_outlets: number;
    closure_rate: number;
  }>;
}

export interface ScenarioSimResult {
  base_revenue: number;
  simulated_revenue: number;
  base_expenses: number;
  simulated_expenses: number;
  base_profit: number;
  simulated_profit: number;
  profit_delta_pct: number;
  base_roi: number;
  simulated_roi: number;
  base_payback: number;
  simulated_payback: number;
  risk_assessment: string;
  stress_test_rating: 'Resilient' | 'Moderate Impact' | 'High Fragility';
}

export interface LocationAnalysisResult {
  city: string;
  locality: string;
  pin_code: string;
  rent_per_sqft: number;
  demand_score: number;
  competition_score: number;
  rent_efficiency_score: number;
  footfall_score: number;
  market_saturation_score: number;
  overall_location_score: number;
  competitor_count: number;
  avg_competitor_distance_km: number;
  competitive_intensity: 'Low' | 'Medium' | 'High';
  comp_badge: string;
  competitors: Array<{
    name: string;
    category: string;
    distance_km: number;
    density: number;
    similar_brand: string;
    competitive_intensity: string;
  }>;
}

export interface WatchlistItem {
  watchlist_id: number;
  franchise_id: number;
  name: string;
  slug: string;
  logo_url?: string;
  sector: string;
  added_date: string;
  added_investment: number;
  current_investment: number;
  investment_delta: number;
  added_roi: number;
  current_roi: number;
  roi_delta: number;
  added_risk: string;
  current_risk: string;
  risk_score: number;
  payback_months: number;
  monthly_profit: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  date: string;
  franchise_id?: number;
}
