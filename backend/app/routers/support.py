import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import List, Optional, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
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
    db = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        try:
            u_id = int(user_id)
        except (ValueError, TypeError):
            u_id = user_id
        user = db["users"].find_one({"id": u_id})
        return wrap_mongo_doc(clean_mongo_doc(user)) if user else None
    except Exception:
        return None

@router.post("/support", response_model=SupportRequestOut)
def create_support_request(
    data: SupportRequestCreate,
    db = Depends(get_db),
    user = Depends(get_optional_user)
):
    last_req = db["support_requests"].find_one(sort=[("id", -1)])
    next_id = (last_req["id"] + 1) if last_req and "id" in last_req else 1

    now = datetime.datetime.utcnow()
    req = {
        "id": next_id,
        "user_id": user.id if user else None,
        "name": user.name if user else (data.name or "Guest Investor"),
        "email": user.email if user else (data.email or "guest@franchiseiq.com"),
        "category": data.category,
        "subject": data.subject.strip(),
        "message": data.message.strip(),
        "status": "OPEN",
        "admin_notes": None,
        "created_at": now,
        "updated_at": now
    }
    db["support_requests"].insert_one(req)
    return wrap_mongo_doc(clean_mongo_doc(req))

@router.get("/support/my-requests", response_model=List[SupportRequestOut])
def get_my_support_requests(
    db = Depends(get_db),
    user = Depends(get_optional_user)
):
    if not user:
        return []
    items = list(db["support_requests"].find({"user_id": user.id}).sort("created_at", -1))
    return [wrap_mongo_doc(clean_mongo_doc(d)) for d in items]

@router.post("/feedback", response_model=FeedbackOut)
def create_feedback(
    data: FeedbackCreate,
    db = Depends(get_db),
    user = Depends(get_optional_user)
):
    last_fb = db["feedback"].find_one(sort=[("id", -1)])
    next_id = (last_fb["id"] + 1) if last_fb and "id" in last_fb else 1

    fb = {
        "id": next_id,
        "user_id": user.id if user else None,
        "name": user.name if user else (data.name or "Anonymous Investor"),
        "email": user.email if user else (data.email or "anonymous@franchiseiq.com"),
        "rating": data.rating,
        "category": data.category,
        "message": data.message.strip(),
        "suggestion": data.suggestion.strip() if data.suggestion else None,
        "status": "REVIEWED",
        "created_at": datetime.datetime.utcnow()
    }
    db["feedback"].insert_one(fb)
    return wrap_mongo_doc(clean_mongo_doc(fb))

@router.get("/help/faq", response_model=List[FaqItem])
def get_faqs():
    return FAQS

@router.post("/help/chat", response_model=ChatResponse)
def handle_chat_message(
    payload: ChatRequest,
    db = Depends(get_db)
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
