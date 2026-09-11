from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.support import SupportRequest, Feedback
from app.schemas.support import (
    SupportRequestCreate, SupportRequestOut,
    FeedbackCreate, FeedbackOut,
    FaqItem, ChatRequest, ChatResponse
)
from app.services.auth import decode_access_token
from app.services.help_engine import FAQS, DEFAULT_QUICK_ACTIONS, process_chat_message

router = APIRouter(tags=["Support & Help"])

def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

@router.post("/support", response_model=SupportRequestOut)
def create_support_request(
    data: SupportRequestCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    req = SupportRequest(
        user_id=user.id if user else None,
        name=user.name if user else (data.name or "Guest Investor"),
        email=user.email if user else (data.email or "guest@franchiseiq.com"),
        category=data.category,
        subject=data.subject.strip(),
        message=data.message.strip(),
        status="OPEN"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/support/my-requests", response_model=List[SupportRequestOut])
def get_my_support_requests(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    if not user:
        return []
    return db.query(SupportRequest).filter(SupportRequest.user_id == user.id).order_by(SupportRequest.created_at.desc()).all()

@router.post("/feedback", response_model=FeedbackOut)
def create_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    fb = Feedback(
        user_id=user.id if user else None,
        name=user.name if user else (data.name or "Anonymous Investor"),
        email=user.email if user else (data.email or "anonymous@franchiseiq.com"),
        rating=data.rating,
        category=data.category,
        message=data.message.strip(),
        suggestion=data.suggestion.strip() if data.suggestion else None,
        status="REVIEWED"
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/help/faq", response_model=List[FaqItem])
def get_faqs():
    return FAQS

@router.post("/help/chat", response_model=ChatResponse)
def handle_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db)
):
    if not payload.message.strip() and not payload.action:
        raise HTTPException(status_code=400, detail="Chat message cannot be empty")

    result = process_chat_message(payload.message, payload.action, db)
    return ChatResponse(
        reply=result["reply"],
        category=result.get("category"),
        quick_actions=result.get("quick_actions", DEFAULT_QUICK_ACTIONS[:5]),
        franchise_data=result.get("franchise_data"),
        action_type=result.get("action_type")
    )
