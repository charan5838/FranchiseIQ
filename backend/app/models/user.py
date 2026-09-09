import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="investor")  # "investor", "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    watchlist_items = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")
    scenarios = relationship("Scenario", back_populates="user")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    budget = Column(Float, default=2500000.0)  # default ₹25 Lakhs
    city = Column(String(100), default="Hyderabad")
    locality = Column(String(100), default="Madhapur")
    preferred_sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="SET NULL"), nullable=True)
    shop_area_sqft = Column(Float, default=800.0)
    business_experience = Column(String(50), default="0-2 years")  # "None", "0-2 years", "3-5 years", "5+ years"
    desired_involvement = Column(String(50), default="full-time")  # "full-time", "part-time"
    risk_preference = Column(String(50), default="Medium")  # "Low", "Medium", "High"
    desired_return_pct = Column(Float, default=25.0)  # 25% ROI
    max_payback_months = Column(Integer, default=30)  # 30 months
    goal = Column(String(50), default="Maximum ROI")  # "Maximum ROI", "Lowest Risk", "Fastest Payback", "Lowest Investment", "Highest Profit", "Highest Growth", "Best Overall"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="preferences")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"))
    added_investment = Column(Float)
    added_roi = Column(Float)
    added_risk = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="watchlist_items")
    franchise = relationship("Franchise")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # "investment_change", "risk_alert", "roi_update", "info"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    franchise = relationship("Franchise")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    entity_type = Column(String(100), nullable=False)  # "franchise", "financial", "verification", "sector"
    entity_id = Column(Integer, nullable=False)
    action = Column(String(50), nullable=False)  # "CREATE", "UPDATE", "DELETE", "VERIFY"
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
