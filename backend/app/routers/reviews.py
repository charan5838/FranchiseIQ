import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Franchisee Feedback & Sentiment"])

class ReviewCreate(BaseModel):
    franchise_id: int
    rating: float
    title: str
    comment: str

class FranchiseeReportCreate(BaseModel):
    franchise_id: int
    outlet_city: str
    operating_years: float
    reported_investment: float
    reported_monthly_revenue: float
    reported_monthly_profit: float
    support_quality: float
    training_quality: float
    marketing_support: float
    supply_chain_quality: float
    overall_satisfaction: float
    would_invest_again: bool
    would_recommend: bool
    comments: Optional[str] = None

@router.post("")
def add_review(
    data: ReviewCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    last_r = db["reviews"].find_one(sort=[("id", -1)])
    next_id = (last_r["id"] + 1) if last_r and "id" in last_r else 1

    now = datetime.datetime.utcnow()
    rev_doc = {
        "id": next_id,
        "franchise_id": data.franchise_id,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "rating": data.rating,
        "title": data.title,
        "comment": data.comment,
        "is_approved": True,
        "created_at": now
    }
    db["reviews"].insert_one(rev_doc)

    # Also push to embedded franchise reviews
    db["franchises"].update_one(
        {"id": data.franchise_id},
        {"$push": {"reviews": rev_doc}}
    )


    return {"status": "success", "review_id": next_id}

@router.post("/franchisee-report")
def submit_franchisee_report(
    data: FranchiseeReportCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    last_rep = db["franchisee_reports"].find_one(sort=[("id", -1)])
    next_id = (last_rep["id"] + 1) if last_rep and "id" in last_rep else 1

    rep_doc = {
        "id": next_id,
        "franchise_id": data.franchise_id,
        "outlet_city": data.outlet_city,
        "operating_years": data.operating_years,
        "reported_investment": data.reported_investment,
        "reported_monthly_revenue": data.reported_monthly_revenue,
        "reported_monthly_profit": data.reported_monthly_profit,
        "support_quality": data.support_quality,
        "training_quality": data.training_quality,
        "marketing_support": data.marketing_support,
        "supply_chain_quality": data.supply_chain_quality,
        "overall_satisfaction": data.overall_satisfaction,
        "would_invest_again": data.would_invest_again,
        "would_recommend": data.would_recommend,
        "comments": data.comments,
        "created_at": datetime.datetime.utcnow()
    }
    db["franchisee_reports"].insert_one(rep_doc)

    db["franchises"].update_one(
        {"id": data.franchise_id},
        {"$push": {"franchisee_reports": rep_doc}}
    )


    return {"status": "success", "report_id": next_id}
