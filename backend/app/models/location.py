from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), index=True, nullable=False)
    locality = Column(String(100), index=True, nullable=False)
    pin_code = Column(String(20), nullable=False)
    tier = Column(String(20), default="Tier-1")  # Tier-1, Tier-2, Tier-3
    avg_rent_sqft = Column(Float, default=120.0)  # ₹ per sqft / month
    footfall_index = Column(Float, default=85.0)  # 0-100
    population_density = Column(Float, default=15000.0)  # people / km2
    commercial_activity_score = Column(Float, default=88.0)  # 0-100
    median_household_income = Column(Float, default=1200000.0)  # ₹ / yr

    location_analyses = relationship("LocationAnalysis", back_populates="location")
    competitors = relationship("Competitor", back_populates="location")

class LocationAnalysis(Base):
    __tablename__ = "location_analysis"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    
    # Sub-scores 0-100
    demand_score = Column(Float, default=85.0)
    competition_score = Column(Float, default=65.0)
    rent_efficiency_score = Column(Float, default=78.0)
    footfall_score = Column(Float, default=90.0)
    market_saturation_score = Column(Float, default=55.0)
    growth_potential_score = Column(Float, default=82.0)
    overall_location_score = Column(Float, default=76.0)  # 0-100

    existing_brand_outlets_nearby = Column(Integer, default=1)
    recommended_min_sqft = Column(Float, default=800.0)
    estimated_daily_footfall = Column(Integer, default=1200)
    summary_notes = Column(Text, nullable=True)

    franchise = relationship("Franchise", back_populates="location_analyses")
    location = relationship("Location", back_populates="location_analyses")

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    competitor_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    distance_km = Column(Float, default=0.8)
    competitor_density = Column(Float, default=4.2)  # competitors / km2
    similar_brand = Column(String(255), nullable=True)
    market_saturation_level = Column(String(50), default="Medium")
    estimated_demand = Column(String(50), default="High")
    competitive_intensity = Column(String(50), default="Medium")  # "Low", "Medium", "High"

    location = relationship("Location", back_populates="competitors")
