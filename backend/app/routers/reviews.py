from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.review import Review, FranchiseeReport
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_rev = Review(
        franchise_id=data.franchise_id,
        user_id=current_user.id,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        is_approved=True
    )
    db.add(new_rev)
    db.commit()
    db.refresh(new_rev)
    return {"status": "success", "review_id": new_rev.id}

@router.post("/franchisee-report")
def submit_franchisee_report(
    data: FranchiseeReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rep = FranchiseeReport(
        franchise_id=data.franchise_id,
        outlet_city=data.outlet_city,
        operating_years=data.operating_years,
        reported_investment=data.reported_investment,
        reported_monthly_revenue=data.reported_monthly_revenue,
        reported_monthly_profit=data.reported_monthly_profit,
        support_quality=data.support_quality,
        training_quality=data.training_quality,
        marketing_support=data.marketing_support,
        supply_chain_quality=data.supply_chain_quality,
        overall_satisfaction=data.overall_satisfaction,
        would_invest_again=data.would_invest_again,
        would_recommend=data.would_recommend,
        comments=data.comments
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return {"status": "success", "report_id": rep.id}
