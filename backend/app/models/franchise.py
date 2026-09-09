import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="General")
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Briefcase")
    is_active = Column(Boolean, default=True)

    franchises = relationship("Franchise", back_populates="sector")

class Franchise(Base):
    __tablename__ = "franchises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="RESTRICT"), nullable=False)
    sub_sector = Column(String(100), nullable=False)
    founded_year = Column(Integer, nullable=False)
    country = Column(String(100), default="India")
    headquarters = Column(String(100), nullable=False)
    website = Column(String(255), nullable=True)
    availability = Column(String(100), default="Available Pan-India")
    franchise_model = Column(String(50), default="FOFO")  # FOFO (Franchise Owned Franchise Operated), FOCO, COCO
    space_min_sqft = Column(Float, default=500.0)
    space_max_sqft = Column(Float, default=1500.0)
    expansion_rate = Column(Float, default=15.0)  # % annual growth in outlets
    brand_age_years = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    sector = relationship("Sector", back_populates="franchises")
    investment = relationship("FranchiseInvestment", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    financial = relationship("FranchiseFinancial", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    operating_costs = relationship("OperatingCost", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    fees = relationship("FranchiseFee", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    support = relationship("FranchisorSupport", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    outlet_info = relationship("Outlet", back_populates="franchise", uselist=False, cascade="all, delete-orphan")
    historical_financials = relationship("HistoricalFinancial", back_populates="franchise", cascade="all, delete-orphan", order_by="HistoricalFinancial.year")
    outlet_history = relationship("OutletHistory", back_populates="franchise", cascade="all, delete-orphan", order_by="OutletHistory.year")
    data_sources = relationship("DataSource", back_populates="franchise", cascade="all, delete-orphan")
    location_analyses = relationship("LocationAnalysis", back_populates="franchise", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="franchise", cascade="all, delete-orphan")
    franchisee_reports = relationship("FranchiseeReport", back_populates="franchise", cascade="all, delete-orphan")

class FranchiseInvestment(Base):
    __tablename__ = "franchise_investments"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    min_investment = Column(Float, nullable=False)
    max_investment = Column(Float, nullable=False)
    franchise_fee = Column(Float, nullable=False)
    security_deposit = Column(Float, default=0.0)
    setup_cost = Column(Float, default=0.0)
    equipment_cost = Column(Float, default=0.0)
    interior_cost = Column(Float, default=0.0)
    technology_cost = Column(Float, default=0.0)
    initial_inventory = Column(Float, default=0.0)
    working_capital = Column(Float, default=0.0)
    other_initial_expenses = Column(Float, default=0.0)
    total_estimated_investment = Column(Float, nullable=False)
    last_updated = Column(String(50), default="September 2026")

    franchise = relationship("Franchise", back_populates="investment")

class FranchiseFinancial(Base):
    __tablename__ = "franchise_financials"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    
    # Claimed vs Actual (Crucial feature)
    claimed_monthly_revenue = Column(Float, nullable=False)
    actual_monthly_revenue = Column(Float, nullable=False)  # estimated or verified
    claimed_annual_revenue = Column(Float, nullable=False)
    actual_annual_revenue = Column(Float, nullable=False)
    
    gross_margin = Column(Float, nullable=False)  # % e.g. 55.0
    operating_margin = Column(Float, nullable=False)  # % e.g. 24.0
    
    claimed_net_margin = Column(Float, nullable=False)  # % e.g. 22.0
    actual_net_margin = Column(Float, nullable=False)    # % e.g. 14.5
    
    claimed_monthly_profit = Column(Float, nullable=False)
    actual_monthly_profit = Column(Float, nullable=False)
    claimed_annual_profit = Column(Float, nullable=False)
    actual_annual_profit = Column(Float, nullable=False)

    break_even_months = Column(Integer, default=18)
    roi_annual = Column(Float, nullable=False)  # % e.g. 32.5%
    roic = Column(Float, nullable=True)         # Return on invested capital
    payback_months = Column(Float, nullable=False)  # e.g. 21.5 months
    
    revenue_stability_score = Column(Float, default=80.0)  # 0-100
    profit_stability_score = Column(Float, default=78.0)   # 0-100
    last_updated = Column(String(50), default="September 2026")

    franchise = relationship("Franchise", back_populates="financial")

class OperatingCost(Base):
    __tablename__ = "operating_costs"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    monthly_rent = Column(Float, nullable=False)
    employee_salaries = Column(Float, nullable=False)
    utilities = Column(Float, default=20000.0)
    raw_materials_cogs = Column(Float, nullable=False)
    inventory = Column(Float, default=30000.0)
    packaging = Column(Float, default=15000.0)
    maintenance = Column(Float, default=10000.0)
    marketing = Column(Float, default=15000.0)
    platform_delivery_commission = Column(Float, default=25000.0)
    insurance = Column(Float, default=5000.0)
    technology_software = Column(Float, default=8000.0)
    other_operating_expenses = Column(Float, default=10000.0)
    total_monthly_expenses = Column(Float, nullable=False)

    franchise = relationship("Franchise", back_populates="operating_costs")

class FranchiseFee(Base):
    __tablename__ = "franchise_fees"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    royalty_percentage = Column(Float, default=5.0)  # %
    royalty_fixed = Column(Float, default=0.0)       # ₹
    marketing_fee_percentage = Column(Float, default=2.0)
    technology_fee = Column(Float, default=5000.0)
    renewal_fee = Column(Float, default=50000.0)
    other_recurring_fees = Column(Float, default=0.0)

    franchise = relationship("Franchise", back_populates="fees")

class FranchisorSupport(Base):
    __tablename__ = "franchisor_support"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    training = Column(Boolean, default=True)
    store_setup_assistance = Column(Boolean, default=True)
    marketing_support = Column(Boolean, default=True)
    technology_stack = Column(Boolean, default=True)
    supply_chain_logistics = Column(Boolean, default=True)
    staff_training = Column(Boolean, default=True)
    location_site_selection = Column(Boolean, default=True)
    launch_support = Column(Boolean, default=True)
    operations_manual_sop = Column(Boolean, default=True)
    business_consulting = Column(Boolean, default=True)
    branding_assets = Column(Boolean, default=True)
    crm_provided = Column(Boolean, default=True)
    pos_billing_software = Column(Boolean, default=True)
    digital_marketing_leads = Column(Boolean, default=True)

    franchise = relationship("Franchise", back_populates="support")
