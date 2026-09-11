import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class FranchiseSource(Base):
    __tablename__ = "franchise_sources"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Official Website URLs (Controlled List)
    official_website = Column(String(500), nullable=False)
    franchise_information_url = Column(String(500), nullable=False)
    franchise_investment_url = Column(String(500), nullable=True)
    franchise_opportunity_url = Column(String(500), nullable=True)
    
    last_fetched_at = Column(DateTime, nullable=True)
    last_successful_fetch_at = Column(DateTime, nullable=True)
    
    # SUCCESS, PARTIAL_SUCCESS, BLOCKED, NOT_FOUND, TIMEOUT, PARSER_ERROR, UNAVAILABLE, DEMO
    fetch_status = Column(String(50), default="PENDING")
    source_version = Column(Integer, default=1)
    
    # LIVE, DEMO, FALLBACK
    source_mode = Column(String(50), default="LIVE")
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    franchise = relationship("Franchise", back_populates="source_config")
    observations = relationship("DataObservation", back_populates="source", cascade="all, delete-orphan")
    fetch_logs = relationship("DataFetchLog", back_populates="source", cascade="all, delete-orphan")


class DataObservation(Base):
    __tablename__ = "data_observations"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("franchise_sources.id", ondelete="SET NULL"), nullable=True)
    
    field_name = Column(String(100), nullable=False, index=True)
    original_value = Column(Text, nullable=False)  # Raw unnormalized string e.g. "Starts from ₹20 Lakhs"
    normalized_value = Column(Float, nullable=True) # Normalized float e.g. 2000000.0
    normalized_text = Column(String(255), nullable=True) # For strings e.g. "FOFO"
    currency = Column(String(20), default="INR")
    
    source_url = Column(String(500), nullable=False)
    source_domain = Column(String(255), nullable=False)
    source_type = Column(String(50), default="OFFICIAL_WEBSITE")  # OFFICIAL_WEBSITE, DEMO, ESTIMATED
    
    # MARKETING_CLAIM, FACTUAL_DISCLOSURE, ESTIMATED, DEMO
    data_classification = Column(String(50), default="MARKETING_CLAIM")
    confidence_score = Column(Float, default=80.0)
    
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)
    valid_from = Column(DateTime, default=datetime.datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)

    # Relationships
    franchise = relationship("Franchise", back_populates="observations")
    source = relationship("FranchiseSource", back_populates="observations")


class DataFetchLog(Base):
    __tablename__ = "data_fetch_logs"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("franchise_sources.id", ondelete="SET NULL"), nullable=True)
    
    url = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False)  # SUCCESS, PARTIAL_SUCCESS, BLOCKED, TIMEOUT, etc.
    http_status = Column(Integer, nullable=True)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)
    error_message = Column(Text, nullable=True)
    fields_extracted_count = Column(Integer, default=0)
    fields_unavailable_count = Column(Integer, default=0)
    response_time_ms = Column(Float, default=0.0)

    # Relationships
    franchise = relationship("Franchise", back_populates="fetch_logs")
    source = relationship("FranchiseSource", back_populates="fetch_logs")
