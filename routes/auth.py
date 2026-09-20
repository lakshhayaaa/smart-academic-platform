from fastapi import APIRouter,Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from schemas.auth import SignInRequest, SignInResponse, SignOutResponse, SignUpResponse,SignUpRequest
from services.auth_service import signup_user,signin_user,signout_user


router=APIRouter(
    prefix="/auth",
    tags=["authentication"]
)
http_bearer = HTTPBearer()

@router.post("/signup",response_model=SignUpResponse)
async def signup(data:SignUpRequest,db:Session=Depends(get_db)):
    try:
        user=signup_user(data,db)
        return SignUpResponse(message="User registered successfully",user_id=user.id)
    except ValueError as e:
        return SignUpResponse(message=str(e))

@router.post("/signin", response_model=SignInResponse)
async def signin(data: SignInRequest, db: Session = Depends(get_db)):
    try:
        token = signin_user(data, db)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return SignInResponse(message="Login successful", access_token=token)

@router.post("/signout",response_model=SignOutResponse)
async def signout(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):
    try:
        signout_user(credentials.credentials)
        return SignOutResponse(message="Logout successful")
    except ValueError as e:
        return SignOutResponse(message=str(e))