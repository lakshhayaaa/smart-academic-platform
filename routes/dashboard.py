
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from utils.dependencies import get_current_user

from models.resouce import Resource
from models.unit import Unit
from models.view import View
from models.download import Download
from models.rating import Rating


router = APIRouter(tags=["Dashboard"])

RECENT_LIMIT = 10


def resource_details(resource, unit_name=None):
    """Return resource information without exposing uploader details."""
    return {
        "resource_id": resource.resource_id,
        "title": resource.title,
        "course_code": resource.course_code,
        "unit_number": resource.unit_number,
        "unit_name": unit_name,
        "resource_type": resource.resource_type,
        "created_at": resource.created_at,
    }


@router.get("/dashboard")
def get_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the logged-in student's uploads, recently viewed
    resources, recently downloaded resources, and ratings.
    """

    roll_no = current_user.roll_no

    try:
        # 1. MY UPLOADS
        my_uploads_query = (
            db.query(Resource, Unit.unit_name)
            .outerjoin(
                Unit,
                (Unit.course_code == Resource.course_code)
                & (Unit.unit_number == Resource.unit_number),
            )
            .filter(Resource.uploaded_by == roll_no)
        )

        my_uploads_total = my_uploads_query.count()

        my_uploads = (
            my_uploads_query
            .order_by(Resource.created_at.desc())
            .limit(RECENT_LIMIT)
            .all()
        )

        # 2. RECENTLY VIEWED RESOURCES
        viewed_query = (
            db.query(View, Resource, Unit.unit_name)
            .join(
                Resource,
                Resource.resource_id == View.resource_id,
            )
            .outerjoin(
                Unit,
                (Unit.course_code == Resource.course_code)
                & (Unit.unit_number == Resource.unit_number),
            )
            .filter(
                View.roll_no == roll_no,
                Resource.status == "ACCEPTED",
            )
        )

        recent_views = (
            viewed_query
            .order_by(View.viewed_at.desc())
            .limit(RECENT_LIMIT)
            .all()
        )

        # 3. RECENTLY DOWNLOADED RESOURCES
        downloads_query = (
            db.query(Download, Resource, Unit.unit_name)
            .join(
                Resource,
                Resource.resource_id == Download.resource_id,
            )
            .outerjoin(
                Unit,
                (Unit.course_code == Resource.course_code)
                & (Unit.unit_number == Resource.unit_number),
            )
            .filter(
                Download.roll_no == roll_no,
                Resource.status == "ACCEPTED",
            )
        )

        recent_downloads = (
            downloads_query
            .order_by(Download.downloaded_at.desc())
            .limit(RECENT_LIMIT)
            .all()
        )

        # 4. MY RATINGS
        ratings_query = (
            db.query(Rating, Resource, Unit.unit_name)
            .join(
                Resource,
                Resource.resource_id == Rating.resource_id,
            )
            .outerjoin(
                Unit,
                (Unit.course_code == Resource.course_code)
                & (Unit.unit_number == Resource.unit_number),
            )
            .filter(
                Rating.roll_no == roll_no,
                Resource.status == "ACCEPTED",
            )
        )

        my_ratings_total = ratings_query.count()

        my_ratings = (
            ratings_query
            .order_by(Rating.created_at.desc())
            .limit(RECENT_LIMIT)
            .all()
        )

        return {
            "student": {
                "roll_no": current_user.roll_no,
                "name": current_user.name,
            },
            "my_uploads": {
                "total": my_uploads_total,
                "items": [
                    {
                        **resource_details(resource, unit_name),
                        "status": resource.status,
                    }
                    for resource, unit_name in my_uploads
                ],
            },
            "recently_viewed": [
                {
                    **resource_details(resource, unit_name),
                    "viewed_at": view.viewed_at,
                }
                for view, resource, unit_name in recent_views
            ],
            "recently_downloaded": [
                {
                    **resource_details(resource, unit_name),
                    "downloaded_at": download.downloaded_at,
                }
                for download, resource, unit_name in recent_downloads
            ],
            "my_ratings": {
                "total": my_ratings_total,
                "items": [
                    {
                        **resource_details(resource, unit_name),
                        "rating_id": rating.rating_id,
                        "rating": rating.rating,
                        "rated_at": rating.created_at,
                    }
                    for rating, resource, unit_name in my_ratings
                ],
            },
        }

    except Exception as exc:
        print("DASHBOARD ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not load dashboard",
        )
