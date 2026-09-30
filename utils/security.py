#password hashing and verification for user sign-up and sign-in

from datetime import datetime, datetime, timedelta
import uuid
import redis
import bcrypt
from dotenv import load_dotenv
import os
from jose import jwt, JWTError

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
Key_expiration_time = 60 * 60 * 24  # 1 day in seconds

r=redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("REDIS_DB"))   
)

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_password.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)

def generate_jwt_token(roll_no: str) -> str:
    payload = {
        "sub": roll_no,
        "exp": datetime.now() + timedelta(seconds=Key_expiration_time),
        "iat": datetime.now(),
        "jti":str(uuid.uuid4())
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

#checks if the token is valid and not expired, if valid returns the roll_no of the user
def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        print(f"JWTError: {e}")
        raise ValueError("Invalid or expired token")
    
#check if the token is revoked by checking if the token exists in redis, if it exists then it is revoked
def is_token_revoked(token:str)->bool:
    return r.exists(f"blocklist:{token}") == 1

#revokes the token by adding it to redis with an expiration time equal to the remaining time of the token
def revoke_token(payload:dict):
    ttl=int(payload["exp"]-datetime.now().timestamp())
    if ttl>0:
        r.setex(f"blocklist:{payload['jti']}", ttl, "true") 