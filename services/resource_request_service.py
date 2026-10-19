
from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.resource_request import ResourceRequest
from models.subjects import Subject
from models.unit import Unit
from schemas.resource_requests import ResourceRequestCreate


def create_resource_requests(
    db: Session,
    data: ResourceRequestCreate,
    requested_by: str,
):
    course_code = data.course_code.strip().upper()
    unit_number = data.unit_number

    # 1. Check whether the course exists.
    course = (
        db.query(Subject)
        .filter(Subject.course_code == course_code)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "This course is not registered. Register the course before submitting your request.",
                "redirect_to": "/register-course",
                "code": "COURSE_NOT_FOUND",
                "course_code": course_code,
                "unit_number": unit_number,
            },
        )

    # 2. Check whether the requested unit exists for this course.
    unit = (
        db.query(Unit)
        .filter(
            Unit.course_code == course_code,
            Unit.unit_number == unit_number,
        )
        .first()
    )

    if not unit:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "This unit is not registered for the selected course. Register the missing unit before submitting your request.",
                "redirect_to": "/register-course",
                "code": "UNIT_NOT_FOUND",
                "course_code": course_code,
                "unit_number": unit_number,
            },
        )

    # 3. Create the request only after validation succeeds.
    resource_request = ResourceRequest(
        requested_by=requested_by,
        course_code=course_code,
        unit_number=unit_number,
        resource_type=data.resource_type,
        status="OPEN",
    )

    try:
        db.add(resource_request)
        db.commit()
        db.refresh(resource_request)
        return resource_request
    except Exception:
        db.rollback()
        raise


def get_resource_requests(db: Session):
    return db.query(ResourceRequest).all()
