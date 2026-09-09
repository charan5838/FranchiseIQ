import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)  # 1.0 to 5.0
    title = Column(String(255), nullable=False)
    comment = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    franchise = relationship("Franchise", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class FranchiseeReport(Base):
    __tablename__ = "franchisee_reports"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    outlet_city = Column(String(100), nullable=False)
    operating_years = Column(Float, default=2.5)
    reported_investment = Column(Float, nullable=False)
    reported_monthly_revenue = Column(Float, nullable=False)
    reported_monthly_profit = Column(Float, nullable=False)
    
    # 1 to 5 ratings
    support_quality = Column(Float, default=4.0)
    training_quality = Column(Float, default=4.2)
    marketing_support = Column(Float, default=3.8)
    supply_chain_quality = Column(Float, default=4.1)
    
    overall_satisfaction = Column(Float, default=78.0)  # 0-100
    would_invest_again = Column(Boolean, default=True)
    would_recommend = Column(Boolean, default=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    franchise = relationship("Franchise", back_populates="franchisee_reports")
