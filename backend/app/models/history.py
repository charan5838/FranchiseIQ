from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class HistoricalFinancial(Base):
    __tablename__ = "historical_financials"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)  # 2022, 2023, 2024, 2025, 2026
    total_investment = Column(Float, nullable=False)
    franchise_fee = Column(Float, nullable=False)
    annual_revenue = Column(Float, nullable=False)
    annual_expenses = Column(Float, nullable=False)
    annual_profit = Column(Float, nullable=False)
    roi_annual = Column(Float, nullable=False)
    royalty_percentage = Column(Float, default=5.0)
    marketing_fee_percentage = Column(Float, default=2.0)
    total_outlets = Column(Integer, nullable=False)
    outlet_openings = Column(Integer, default=0)
    outlet_closures = Column(Integer, default=0)
    closure_rate = Column(Float, default=2.0)  # %

    franchise = relationship("Franchise", back_populates="historical_financials")

class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True)
    total_outlets = Column(Integer, nullable=False)
    company_owned = Column(Integer, default=10)
    franchise_owned = Column(Integer, default=90)
    active_outlets = Column(Integer, nullable=False)
    closed_outlets = Column(Integer, default=2)
    closure_rate_pct = Column(Float, default=2.0)

    franchise = relationship("Franchise", back_populates="outlet_info")

class OutletHistory(Base):
    __tablename__ = "outlet_history"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    total_outlets = Column(Integer, nullable=False)
    openings = Column(Integer, default=0)
    closures = Column(Integer, default=0)

    franchise = relationship("Franchise", back_populates="outlet_history")
