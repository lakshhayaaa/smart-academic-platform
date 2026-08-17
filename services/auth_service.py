from sqlalchemy.orm import Session

from models.user import User
from models.department import Department
from models.regulation import Regulation

from schemas.auth import SignUpRequest
from utils.academic_dept import get_department_code
from utils.security import hash_password

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
        User.college_email==data.college_email
    ).first()

    if existing_email:
        raise ValueError("College email already registered")

    hashed_password=hash_password(data.password)

    user=User(
        roll_no=data.roll_no,
        name=data.name,
        college_email=data.college_email,
        password_hash=hashed_password,
        department_code=department_code,
        regulation_year=data.regulation_year
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user