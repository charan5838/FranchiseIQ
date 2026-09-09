from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "investor"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    name: str
    role: str

class UserPreferencesUpdate(BaseModel):
    budget: float
    city: str
    locality: str
    preferred_sector_id: Optional[int] = None
    shop_area_sqft: float
    business_experience: str = "0-2 years"
    desired_involvement: str = "full-time"
    risk_preference: str = "Medium"
    desired_return_pct: float = 25.0
    max_payback_months: int = 30
    goal: str = "Maximum ROI"

class QuickLoginRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    budget: Optional[float] = 2500000.0
    city: Optional[str] = "Hyderabad"
    locality: Optional[str] = "Madhapur"
    preferred_sector_id: Optional[int] = None
    risk_preference: Optional[str] = "Medium"
    business_experience: Optional[str] = "0-2 years"
    desired_involvement: Optional[str] = "full-time"
    goal: Optional[str] = "Maximum ROI"

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

