from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from redis import credentials
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from utils.security import SECRET_KEY, ALGORITHM, decode_access_token, is_token_revoked

http_bearer = HTTPBearer()

def get_current_user(auth_credentials: HTTPAuthorizationCredentials = Depends(http_bearer), db: Session = Depends(get_db)) -> User:
    token=auth_credentials.credentials
    if is_token_revoked(token):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    roll_no=payload.get("sub")
    if roll_no is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(User).filter(User.roll_no == roll_no).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user