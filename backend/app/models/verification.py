import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)  # "Investment", "Revenue", "Profit", "Royalty", "Outlets", "Margins"
    
    # 4 levels: VERIFIED, REPORTED, ESTIMATED, MARKETING_CLAIM
    source_type = Column(String(50), nullable=False, default="ESTIMATED")
    source_name = Column(String(255), nullable=False)  # e.g. "Audited FY25 Annual Report", "Franchisee Sample Survey (N=42)", "Franchisor Official Brochure"
    methodology = Column(Text, nullable=False)        # Detailed explanation of methodology
    confidence_level = Column(Float, default=85.0)    # 0-100%
    verification_date = Column(String(50), default="September 2026")
    verified_by = Column(String(100), default="FranchiseIQ Audit Team")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    franchise = relationship("Franchise", back_populates="data_sources")

class DataVerification(Base):
    __tablename__ = "data_verifications"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id", ondelete="CASCADE"), nullable=False)
    overall_confidence_score = Column(Float, default=85.0)  # 0-100
    audited_count = Column(Integer, default=5)
    reported_count = Column(Integer, default=3)
    estimated_count = Column(Integer, default=2)
    marketing_claim_count = Column(Integer, default=1)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    verifier_notes = Column(Text, nullable=True)
