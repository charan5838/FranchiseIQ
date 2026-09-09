from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User, UserPreference
from app.schemas.user import UserRegister, UserLogin, Token, UserOut, UserPreferencesUpdate, QuickLoginRequest
from app.services.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired"
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = User(
        email=data.email.lower(),
        name=data.name,
        hashed_password=hash_password(data.password),
        role=data.role or "investor"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default user preferences
    pref = UserPreference(user_id=new_user.id)
    db.add(pref)
    db.commit()

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role
    )

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )

@router.get("/demo-investor", response_model=Token)
def demo_investor_login(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "investor@franchiseiq.com").first()
    if not user:
        user = User(
            email="investor@franchiseiq.com",
            name="Rajesh Sharma (Demo Investor)",
            hashed_password=hash_password("Investor@123"),
            role="investor"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db.add(UserPreference(user_id=user.id))
        db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )

@router.get("/demo-admin", response_model=Token)
def demo_admin_login(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "admin@franchiseiq.com").first()
    if not user:
        user = User(
            email="admin@franchiseiq.com",
            name="Platform Administrator",
            hashed_password=hash_password("Admin@123"),
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )

@router.post("/quick-login", response_model=Token)
def quick_login(data: QuickLoginRequest, db: Session = Depends(get_db)):
    clean_name = data.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name is required")

    email = (data.email.strip().lower() if data.email and data.email.strip()
             else f"{clean_name.lower().replace(' ', '')}{abs(hash(clean_name)) % 10000}@investor.com")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            name=clean_name,
            hashed_password=hash_password("QuickInvestor@123"),
            role="investor"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        pref = UserPreference(
            user_id=user.id,
            budget=data.budget or 2500000.0,
            city=data.city or "Hyderabad",
            locality=data.locality or "Madhapur",
            preferred_sector_id=data.preferred_sector_id,
            business_experience=data.business_experience or "0-2 years",
            desired_involvement=data.desired_involvement or "full-time",
            risk_preference=data.risk_preference or "Medium",
            goal=data.goal or "Maximum ROI"
        )
        db.add(pref)
        db.commit()
    else:
        user.name = clean_name
        pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
        if pref:
            if data.budget: pref.budget = data.budget
            if data.city: pref.city = data.city
            if data.locality: pref.locality = data.locality
            if data.preferred_sector_id: pref.preferred_sector_id = data.preferred_sector_id
            if data.risk_preference: pref.risk_preference = data.risk_preference
        db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/preferences")
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences")
def update_user_preferences(
    data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(pref, field, value)

    db.commit()
    db.refresh(pref)
    return pref
