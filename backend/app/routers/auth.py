import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional, Dict, Any
from app.database import get_db, wrap_mongo_doc, clean_mongo_doc, MongoDoc
from app.schemas.user import UserRegister, UserLogin, Token, UserOut, UserPreferencesUpdate, QuickLoginRequest
from app.services.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
):
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
    try:
        u_id = int(user_id)
    except (ValueError, TypeError):
        u_id = user_id

    user = db["users"].find_one({"id": u_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return wrap_mongo_doc(clean_mongo_doc(user))

@router.post("/register", response_model=Token)
def register(data: UserRegister, db = Depends(get_db)):
    existing = db["users"].find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    last_u = db["users"].find_one(sort=[("id", -1)])
    next_id = (last_u["id"] + 1) if last_u and "id" in last_u else 1

    new_user = {
        "id": next_id,
        "email": data.email.lower(),
        "name": data.name,
        "hashed_password": hash_password(data.password),
        "role": data.role or "investor",
        "created_at": datetime.datetime.utcnow(),
        "preferences": {
            "budget": 2500000.0,
            "city": "Hyderabad",
            "locality": "Madhapur",
            "preferred_sector_id": None,
            "business_experience": "0-2 years",
            "desired_involvement": "full-time",
            "risk_preference": "Medium",
            "goal": "Balanced Growth"
        }
    }
    db["users"].insert_one(new_user)

    token = create_access_token({"sub": next_id, "email": new_user["email"], "role": new_user["role"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=next_id,
        email=new_user["email"],
        name=new_user["name"],
        role=new_user["role"]
    )

@router.post("/login", response_model=Token)
def login(data: UserLogin, db = Depends(get_db)):
    user = db["users"].find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"]
    )

@router.get("/demo-investor", response_model=Token)
def demo_investor_login(db = Depends(get_db)):
    user = db["users"].find_one({"email": "investor@franchiseiq.com"})
    if not user:
        last_u = db["users"].find_one(sort=[("id", -1)])
        next_id = (last_u["id"] + 1) if last_u and "id" in last_u else 1
        user = {
            "id": next_id,
            "email": "investor@franchiseiq.com",
            "name": "Rajesh Sharma (Demo Investor)",
            "hashed_password": hash_password("Investor@123"),
            "role": "investor",
            "created_at": datetime.datetime.utcnow(),
            "preferences": {
                "budget": 2500000.0,
                "city": "Hyderabad",
                "locality": "Madhapur",
                "preferred_sector_id": 1,
                "business_experience": "0-2 years",
                "desired_involvement": "full-time",
                "risk_preference": "Medium",
                "goal": "Balanced Growth"
            }
        }
        db["users"].insert_one(user)

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"]
    )

@router.get("/demo-admin", response_model=Token)
def demo_admin_login(db = Depends(get_db)):
    user = db["users"].find_one({"email": "admin@franchiseiq.com"})
    if not user:
        last_u = db["users"].find_one(sort=[("id", -1)])
        next_id = (last_u["id"] + 1) if last_u and "id" in last_u else 2
        user = {
            "id": next_id,
            "email": "admin@franchiseiq.com",
            "name": "Platform Administrator",
            "hashed_password": hash_password("Admin@123"),
            "role": "admin",
            "created_at": datetime.datetime.utcnow(),
            "preferences": None
        }
        db["users"].insert_one(user)

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"]
    )

@router.post("/host-login", response_model=Token)
def host_login(data: UserLogin, db = Depends(get_db)):
    allowed_host_keys = ["Charan@2026", "Host@2026", "Admin@123"]
    if data.password not in allowed_host_keys:
        raise HTTPException(status_code=401, detail="Invalid Host Security Passcode. Access denied.")

    user = db["users"].find_one({"email": "charan@franchiseiq.com"})
    if not user:
        last_u = db["users"].find_one(sort=[("id", -1)])
        next_id = (last_u["id"] + 1) if last_u and "id" in last_u else 3
        user = {
            "id": next_id,
            "email": "charan@franchiseiq.com",
            "name": "Charan (Host)",
            "hashed_password": hash_password("Charan@2026"),
            "role": "admin",
            "created_at": datetime.datetime.utcnow(),
            "preferences": None
        }
        db["users"].insert_one(user)

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": "admin"})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        name="Charan (Host)",
        role="admin"
    )

@router.post("/quick-login", response_model=Token)
def quick_login(data: QuickLoginRequest, db = Depends(get_db)):
    clean_name = data.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name is required")

    email = (data.email.strip().lower() if data.email and data.email.strip()
             else f"{clean_name.lower().replace(' ', '')}{abs(hash(clean_name)) % 10000}@investor.com")

    user = db["users"].find_one({"email": email})
    if not user:
        last_u = db["users"].find_one(sort=[("id", -1)])
        next_id = (last_u["id"] + 1) if last_u and "id" in last_u else 1
        pref = {
            "budget": data.budget or 2500000.0,
            "city": data.city or "Hyderabad",
            "locality": data.locality or "Madhapur",
            "preferred_sector_id": data.preferred_sector_id,
            "business_experience": data.business_experience or "0-2 years",
            "desired_involvement": data.desired_involvement or "full-time",
            "risk_preference": data.risk_preference or "Medium",
            "goal": data.goal or "Maximum ROI"
        }
        user = {
            "id": next_id,
            "email": email,
            "name": clean_name,
            "hashed_password": hash_password("QuickInvestor@123"),
            "role": "investor",
            "created_at": datetime.datetime.utcnow(),
            "preferences": pref
        }
        db["users"].insert_one(user)
    else:
        update_fields = {"name": clean_name}
        if data.budget: update_fields["preferences.budget"] = data.budget
        if data.city: update_fields["preferences.city"] = data.city
        if data.locality: update_fields["preferences.locality"] = data.locality
        if data.preferred_sector_id: update_fields["preferences.preferred_sector_id"] = data.preferred_sector_id
        if data.risk_preference: update_fields["preferences.risk_preference"] = data.risk_preference
        db["users"].update_one({"id": user["id"]}, {"$set": update_fields})


    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user.get("role", "investor")})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role", "investor")
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/preferences")
def get_user_preferences(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    user = db["users"].find_one({"id": current_user.id})
    pref = user.get("preferences") if user else None
    if not pref:
        pref = {
            "budget": 2500000.0,
            "city": "Hyderabad",
            "locality": "Madhapur",
            "preferred_sector_id": None,
            "business_experience": "0-2 years",
            "desired_involvement": "full-time",
            "risk_preference": "Medium",
            "goal": "Balanced Growth"
        }
        db["users"].update_one({"id": current_user.id}, {"$set": {"preferences": pref}})
    return pref

@router.put("/preferences")
def update_user_preferences(
    data: UserPreferencesUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    updates = {}
    for field, value in data.dict(exclude_unset=True).items():
        updates[f"preferences.{field}"] = value

    if updates:
        db["users"].update_one({"id": current_user.id}, {"$set": updates})

    user = db["users"].find_one({"id": current_user.id})
    return user.get("preferences", {})

