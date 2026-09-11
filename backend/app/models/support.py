import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(150), nullable=True)
    email = Column(String(200), nullable=True)
    category = Column(String(100), default="Franchise Data")  # Franchise Data, Account, Technical Issue, Payment/Subscription, Feedback, Other
    subject = Column(String(250), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")  # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", backref="support_requests", foreign_keys=[user_id])


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(150), nullable=True)
    email = Column(String(200), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    category = Column(String(100), default="General Experience")  # Website/UI, Franchise Data, Recommendations, Calculator, Chatbot, General Experience
    message = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=True)
    status = Column(String(50), default="REVIEWED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", backref="feedbacks", foreign_keys=[user_id])
