import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    scenario_name = Column(String(255), default="Custom Scenario")
    
    # Delta percentages
    sales_delta_pct = Column(Float, default=0.0)      # e.g. -20.0
    rent_delta_pct = Column(Float, default=0.0)       # e.g. +15.0
    salaries_delta_pct = Column(Float, default=0.0)   # e.g. +10.0
    cogs_delta_pct = Column(Float, default=0.0)       # e.g. +12.0
    demand_delta_pct = Column(Float, default=0.0)     # e.g. +20.0
    
    # Output metrics
    projected_monthly_revenue = Column(Float, nullable=False)
    projected_monthly_expenses = Column(Float, nullable=False)
    projected_monthly_profit = Column(Float, nullable=False)
    projected_net_margin = Column(Float, nullable=False)
    projected_roi = Column(Float, nullable=False)
    projected_payback_months = Column(Float, nullable=False)
    risk_level = Column(String(50), default="Medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scenarios")
    franchise = relationship("Franchise")

class Projection(Base):
    __tablename__ = "projections"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    timeframe_years = Column(Integer, nullable=False)  # 1, 3, 5
    scenario_type = Column(String(50), nullable=False)  # "Conservative", "Expected", "Optimistic"
    
    projected_annual_revenue = Column(Float, nullable=False)
    projected_annual_expenses = Column(Float, nullable=False)
    projected_annual_profit = Column(Float, nullable=False)
    projected_roi = Column(Float, nullable=False)
    projected_payback_months = Column(Float, nullable=False)
    projected_total_outlets = Column(Integer, nullable=False)
    disclaimer = Column(String(255), default="MODEL ESTIMATE — NOT GUARANTEED")
