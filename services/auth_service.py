from sqlalchemy.orm import Session

from models.user import User
from models.department import Department
from models.regulation import Regulation

from schemas.auth import SignUpRequest,SignInRequest
from utils.academic_dept import get_department_code
from utils.security import hash_password,verify_password, revoke_token, decode_access_token,generate_jwt_token as create_access_token
import os


def signup_user(data:SignUpRequest,db:Session):

    department_code=get_department_code(data.roll_no)

    department=db.query(Department).filter(
        Department.department_code==department_code
    ).first()

    if not department:
        raise ValueError("Invalid department in roll number")

    regulation=db.query(Regulation).filter(
        Regulation.regulation_year==data.regulation_year
    ).first()

    if not regulation:
        raise ValueError("Invalid regulation year")

    existing_user=db.query(User).filter(
        User.roll_no==data.roll_no
    ).first()

    if existing_user:
        raise ValueError("Roll number already registered")

    existing_email=db.query(User).filter(
        User.college_email==data.email
    ).first()

    if existing_email:
        raise ValueError("College email already registered")

    hashed_password=hash_password(data.password)

    user=User(
        roll_no=data.roll_no,
        name=data.name,
        college_email=data.email,
        password_hash=hashed_password,
        department_code=department_code,
        regulation_year=data.regulation_year
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def signin_user(data:SignInRequest,db:Session):
    user=db.query(User).filter(
        User.college_email==data.email
    ).first()

    if not user:
        raise ValueError("User not found")

    if not verify_password(data.password,user.password_hash):
        raise ValueError("Incorrect password")

    token=create_access_token(user.roll_no)
    return token

def signout_user(token:str):
    payload = decode_access_token(token)
    revoke_token(payload)
    return {"message": "Logout successful"}
