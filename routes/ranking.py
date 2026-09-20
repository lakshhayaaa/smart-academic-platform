from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.ranking import rank_resources


router = APIRouter(
    prefix="/ranking",
    tags=["Ranking"]
)


@router.get("")
def get_ranked_resources(
    course_code: Optional[str] = None,
    unit_number: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return rank_resources(
        db=db,
        course_code=course_code,
        unit_number=unit_number
    )