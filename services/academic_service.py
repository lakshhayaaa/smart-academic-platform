
from sqlalchemy.orm import Session

from models.department import Department
from models.regulation import Regulation
from models.subjects import Subject
from models.unit import Unit
from schemas.academic import CourseRegistrationRequest


def validate_academic_selection(
    *,
    department_code: str,
    regulation_year: int,
    semester_number: int,
    course_code: str,
    unit_number: int,
    db: Session,
):
    """Validate academic selections before a resource is uploaded."""

    department = db.query(Department).filter(
        Department.department_code == department_code
    ).first()

    if not department:
        return {
            "success": False,
            "error": "DEPARTMENT_NOT_FOUND",
            "message": "This department is not registered. Contact the platform administrator.",
        }

    regulation = db.query(Regulation).filter(
        Regulation.regulation_year == regulation_year
    ).first()

    if not regulation:
        return {
            "success": False,
            "error": "REGULATION_NOT_FOUND",
            "message": "This regulation is not registered. Contact the platform administrator.",
        }

    subject = db.query(Subject).filter(
        Subject.course_code == course_code
    ).first()

    if not subject:
        return {
            "success": False,
            "error": "COURSE_NOT_FOUND",
            "message": "This course is not registered. Please register it before uploading.",
        }

    if (
        subject.department_code != department_code
        or subject.regulation_year != regulation_year
        or subject.semester_number != semester_number
    ):
        return {
            "success": False,
            "error": "COURSE_DETAILS_MISMATCH",
            "message": "The course code does not match the selected department, regulation, or semester.",
        }

    unit = db.query(Unit).filter(
        Unit.course_code == course_code,
        Unit.unit_number == unit_number,
    ).first()

    if not unit:
        return {
            "success": False,
            "error": "UNIT_NOT_FOUND",
            "message": "This unit is not registered. Please register the missing unit.",
        }

    return {"success": True}


def register_course(
    data: CourseRegistrationRequest,
    db: Session,
):
    department = db.query(Department).filter(
        Department.department_code == data.department_code
    ).first()

    if not department:
        return {
            "success": False,
            "error": "DEPARTMENT_NOT_FOUND",
            "message": "The selected department does not exist.",
        }

    regulation = db.query(Regulation).filter(
        Regulation.regulation_year == data.regulation_year
    ).first()

    if not regulation:
        return {
            "success": False,
            "error": "REGULATION_NOT_FOUND",
            "message": "The selected regulation does not exist.",
        }

    existing_course = db.query(Subject).filter(
        Subject.course_code == data.course_code
    ).first()

    if existing_course:
        return {
            "success": False,
            "error": "COURSE_ALREADY_EXISTS",
            "message": "This course code is already registered.",
        }

    try:
        subject = Subject(
            course_code=data.course_code,
            course_name=data.course_name,
            department_code=data.department_code,
            regulation_year=data.regulation_year,
            semester_number=data.semester_number,
        )

        db.add(subject)
        db.flush()

        for unit_data in data.units:
            unit = Unit(
                course_code=data.course_code,
                unit_number=unit_data.unit_number,
                unit_name=unit_data.unit_name,
            )
            db.add(unit)

        db.commit()
        db.refresh(subject)

        return {
            "success": True,
            "course": subject,
        }

    except Exception:
        db.rollback()

        return {
            "success": False,
            "error": "REGISTRATION_FAILED",
            "message": "Could not register the course. Please try again.",
        }
