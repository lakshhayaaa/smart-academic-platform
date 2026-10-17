
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas.academic import (
    CourseRegistrationRequest,
    CourseRegistrationResponse,
)
from services.academic_service import register_course
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)


@router.post(
    "/register",
    response_model=CourseRegistrationResponse,
    status_code=201,
)
def register_new_course(
    data: CourseRegistrationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = register_course(data, db)

    if not result["success"]:
        status_codes = {
            "DEPARTMENT_NOT_FOUND": 404,
            "REGULATION_NOT_FOUND": 404,
            "COURSE_ALREADY_EXISTS": 409,
        }

        raise HTTPException(
            status_code=status_codes.get(
                result["error"], 500
            ),
            detail={
                "code": result["error"],
                "message": result["message"],
            },
        )

    return result["course"]
