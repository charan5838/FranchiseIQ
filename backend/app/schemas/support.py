from pydantic import BaseModel, Field
from typing import Optional, List, Any
import datetime

class SupportRequestCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=250)
    category: str = Field(default="Franchise Data")
    message: str = Field(..., min_length=5)
    name: Optional[str] = None
    email: Optional[str] = None

class SupportRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class SupportRequestOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    category: str
    subject: str
    message: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    category: str = Field(default="General Experience")
    message: str = Field(..., min_length=3)
    suggestion: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    rating: int
    category: str
    message: str
    suggestion: Optional[str] = None
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FaqItem(BaseModel):
    id: str
    category: str
    question: str
    answer: str
    tags: List[str] = []

class ChatRequest(BaseModel):
    message: str
    action: Optional[str] = None
    franchise_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    category: Optional[str] = None
    quick_actions: List[str] = []
    franchise_data: Optional[dict] = None
    action_type: Optional[str] = None
