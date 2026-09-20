from sqlalchemy import func
from sqlalchemy.orm import Session

from models.resouce import Resource
from models.download import Download
from models.rating import Rating
from models.comment import Comment
from models.subjects import Subject
from models.unit import Unit


def get_resource_score(resource_id: int, db: Session):
    # Count downloads
    download_count = (
        db.query(func.count(Download.download_id))
        .filter(Download.resource_id == resource_id)
        .scalar()
        or 0
    )

    # Calculate average rating
    average_rating = (
        db.query(func.avg(Rating.rating))
        .filter(Rating.resource_id == resource_id)
        .scalar()
        or 0
    )

    # Count comments
    comment_count = (
        db.query(func.count(Comment.comment_id))
        .filter(Comment.resource_id == resource_id)
        .scalar()
        or 0
    )

    # Calculate ranking score
    score = (
        (download_count * 2)
        + (float(average_rating) * 3)
        + (comment_count * 1)
    )

    return {
        "resource_id": resource_id,
        "download_count": download_count,
        "average_rating": round(float(average_rating), 2),
        "comment_count": comment_count,
        "score": round(score, 2)
    }


def rank_resources(
    db: Session,
    course_code: str = None,
    unit_number: int = None
):
    query = db.query(Resource)

    if course_code:
        query = query.filter(
            Resource.course_code == course_code
        )

    if unit_number is not None:
        query = query.filter(
            Resource.unit_number == unit_number
        )

    resources = query.all()

    ranked_resources = []

    for resource in resources:

        ranking = get_resource_score(
            resource.resource_id,
            db
        )

        # Find subject information
        subject = (
            db.query(Subject)
            .filter(
                Subject.course_code == resource.course_code
            )
            .first()
        )

        # Find unit information
        unit = (
            db.query(Unit)
            .filter(
                Unit.course_code == resource.course_code,
                Unit.unit_number == resource.unit_number
            )
            .first()
        )

        ranked_resources.append({
            "resource_id": resource.resource_id,
            "title": resource.title,
            "course_code": resource.course_code,
            "unit_number": resource.unit_number,
            "unit_name": unit.unit_name if unit else None,
            "course_name": subject.course_name if subject else None,
            "regulation_year": subject.regulation_year if subject else None,
            "semester": None,
            "resource_type": resource.resource_type,
            "status": resource.status,
            "created_at": resource.created_at,
            "download_count": ranking["download_count"],
            "average_rating": ranking["average_rating"],
            "comment_count": ranking["comment_count"],
            "score": ranking["score"]
        })

    ranked_resources.sort(
        key=lambda resource: resource["score"],
        reverse=True
    )

    return ranked_resources
