from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import SignUpResponse,SignUpRequest
from services.auth_service import signup_user


router=APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/signup",response_model=SignUpResponse)
async def signup(data:SignUpRequest,db:Session=Depends(get_db)):
    signup_user(data,db)

    return{
        "message":"Account created successfully"
    }
    

@router.post("/signin")
async def signin():
    return {"message": "Sign-in endpoint"}

@router.post("/signout")
async def signout():
    return {"message": "Sign-out endpoint"}