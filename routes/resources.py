
from pathlib import Path
from uuid import uuid4
from mimetypes import guess_type

from fastapi import (
    APIRouter,
    Form,
    UploadFile,
    File,
    Depends,
    HTTPException,
    Query,
)
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session

from database import get_db
from supabase_client import supabase

from models.resouce import Resource
from models.unit import Unit
from models.rating import Rating
from models.download import Download
from models.view import View
from models.resource_request import ResourceRequest

from schemas.resources import (
    ResourceTypeEnum,
    ResourceUploadResponse,
)
from services.resource_service import upload_resource as save_resource
from utils.dependencies import get_current_user
from services.ranking import get_resource_score

router = APIRouter(prefix="/resources", tags=["Resources"])

BUCKET_NAME = "academic-resources"
SIGNED_URL_EXPIRY = 300


class RatingRequest(BaseModel):
    rating: int = Field(ge=1, le=5)


def create_signed_url(file_path: str) -> str:
    """Generate a temporary URL for a private Supabase Storage file."""
    result = (
        supabase.storage
        .from_(BUCKET_NAME)
        .create_signed_url(
            file_path,
            expires_in=SIGNED_URL_EXPIRY,
        )
    )

    signed_url = (
        result.get("signedURL")
        or result.get("signedUrl")
        or result.get("signed_url")
    )

    if not signed_url:
        raise RuntimeError("Supabase did not return a signed URL")

    return signed_url


# =========================================================
# 1. SEARCH RESOURCES
# =========================================================


@router.get("/search")
def search_resources(
    q: str | None = Query(default=None, max_length=100),
    course_code: str | None = Query(default=None, max_length=30),
    unit_number: int | None = Query(default=None, ge=1),
    resource_type: ResourceTypeEnum | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Search accepted resources and return them in ranking order.
    Supports keyword search, course, unit, resource type,
    and pagination.
    """

    query = (
        db.query(Resource, Unit.unit_name)
        .join(
            Unit,
            and_(
                Unit.course_code == Resource.course_code,
                Unit.unit_number == Resource.unit_number,
            ),
        )
        .filter(Resource.status == "ACCEPTED")
    )

    # Keyword search
    if q and q.strip():
        keyword = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Resource.title.ilike(keyword),
                Resource.course_code.ilike(keyword),
            )
        )

    # Course filter
    if course_code and course_code.strip():
        query = query.filter(
            Resource.course_code.ilike(course_code.strip())
        )

    # Unit filter
    if unit_number is not None:
        query = query.filter(
            Resource.unit_number == unit_number
        )

    # Resource type filter
    if resource_type is not None:
        query = query.filter(
            Resource.resource_type == resource_type.value
        )

    # Get all matching resources before pagination
    results = query.all()

    ranked_results = []

    for resource, unit_name in results:
        ranking = get_resource_score(
            resource.resource_id,
            db,
        )

        ranked_results.append({
            "resource_id": resource.resource_id,
            "title": resource.title,
            "course_code": resource.course_code,
            "unit_number": resource.unit_number,
            "unit_name": unit_name,
            "resource_type": resource.resource_type,
            "status": resource.status,
            "created_at": resource.created_at,
            "score": ranking["score"],
            "download_count": ranking["download_count"],
            "average_rating": ranking["average_rating"],
            "comment_count": ranking["comment_count"],
        })

    # Highest score first; newest first for ties
    ranked_results.sort(
        key=lambda resource: (
            resource["score"],
            resource["created_at"],
        ),
        reverse=True,
    )

    # Paginate after ranking
    total = len(ranked_results)
    items = ranked_results[offset:offset + limit]

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items,
    }



# =========================================================
# 2. VIEW A RESOURCE
# =========================================================

@router.get("/{resource_id}")
def view_resource(
    resource_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve resource details and a temporary preview URL.
    Also records that the current student viewed the resource.
    """

    result = (
        db.query(Resource, Unit.unit_name)
        .outerjoin(
            Unit,
            and_(
                Unit.course_code == Resource.course_code,
                Unit.unit_number == Resource.unit_number,
            ),
        )
        .filter(
            Resource.resource_id == resource_id,
            Resource.status == "ACCEPTED",
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or unavailable",
        )

    resource, unit_name = result

    try:
        signed_url = create_signed_url(resource.file_path)
    except Exception as exc:
        print("VIEW URL ERROR:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail="Could not generate the resource preview link",
        )

    try:
        new_view = View(
            resource_id=resource.resource_id,
            roll_no=current_user.roll_no,
        )

        db.add(new_view)
        db.commit()

    except Exception as exc:
        db.rollback()
        print("VIEW RECORD ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not record resource view",
        )

    return {
        "resource_id": resource.resource_id,
        "title": resource.title,
        "course_code": resource.course_code,
        "unit_number": resource.unit_number,
        "unit_name": unit_name,
        "resource_type": resource.resource_type,
        "status": resource.status,
        "created_at": resource.created_at,
        "signed_url": signed_url,
        "expires_in": SIGNED_URL_EXPIRY,
    }


# =========================================================
# 3. DOWNLOAD A RESOURCE
# =========================================================

@router.get("/{resource_id}/download")
def download_resource(
    resource_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = (
        db.query(Resource)
        .filter(
            Resource.resource_id == resource_id,
            Resource.status == "ACCEPTED",
        )
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or unavailable",
        )

    try:
        signed_url = create_signed_url(resource.file_path)
    except Exception as exc:
        print("DOWNLOAD URL ERROR:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail="Could not generate the download link",
        )

    try:
        new_download = Download(
            resource_id=resource.resource_id,
            roll_no=current_user.roll_no,
        )

        db.add(new_download)
        db.commit()
        db.refresh(new_download)

    except Exception as exc:
        db.rollback()
        print("DOWNLOAD RECORD ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not record download",
        )

    return {
        "message": "Download link generated successfully",
        "download_id": new_download.download_id,
        "title": resource.title,
        "signed_url": signed_url,
        "expires_in": SIGNED_URL_EXPIRY,
    }


# =========================================================
# 4. UPLOAD A RESOURCE
# =========================================================

@router.post(
    "/upload",
    response_model=ResourceUploadResponse,
)
async def upload_resource(
    title: str = Form(...),
    department_code: str = Form(...),
    regulation_year: int = Form(...),
    semester_number: int = Form(...),
    course_code: str = Form(...),
    unit_number: int = Form(...),
    resource_type: ResourceTypeEnum = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Resource title cannot be empty",
        )

    if unit_number < 1 or semester_number < 1:
        raise HTTPException(
            status_code=400,
            detail="Semester and unit numbers must be positive",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing",
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty",
            )

        result = save_resource(
            title=title.strip(),
            department_code=department_code.strip(),
            regulation_year=regulation_year,
            semester_number=semester_number,
            course_code=course_code.strip(),
            unit_number=unit_number,
            resource_type=resource_type.value,
            filename=file.filename,
            file_bytes=file_bytes,
            uploaded_by=current_user.roll_no,
            db=db,
        )

    finally:
        await file.close()

    if not result["success"]:
        error = result.get(
            "error",
            "RESOURCE_SAVE_FAILED",
        )
        message = result.get(
            "message",
            "Could not upload resource.",
        )

        # The frontend can open course/unit registration.
        if error in {"COURSE_NOT_FOUND", "UNIT_NOT_FOUND"}:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": error,
                    "message": message,
                    "redirect_to": "/register-course",
                    "course_code": course_code,
                    "unit_number": unit_number,
                },
            )

        if error in {
            "DEPARTMENT_NOT_FOUND",
            "REGULATION_NOT_FOUND",
            "COURSE_DETAILS_MISMATCH",
        }:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": error,
                    "message": message,
                },
            )

        if error in {
            "INVALID_TITLE",
            "EMPTY_FILE",
            "INVALID_FILE_TYPE",
            "Invalid file type",
            "Duplicate resource",
            "Low quality or unreadable file",
        }:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": error,
                    "message": message,
                },
            )

        if error == "FILE_PROCESSING_FAILED":
            raise HTTPException(
                status_code=422,
                detail={
                    "code": error,
                    "message": message,
                },
            )

        raise HTTPException(
            status_code=500,
            detail={
                "code": error,
                "message": message,
            },
        )

    resource = result["resource"]

    return ResourceUploadResponse(
        resource_id=resource.resource_id,
        title=resource.title,
        course_code=resource.course_code,
        unit_number=resource.unit_number,
        resource_type=resource.resource_type,
        status=resource.status,
        created_at=resource.created_at,
    )


# =========================================================
# 5. DELETE A RESOURCE
# =========================================================

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Only the student who uploaded the resource can delete it.

    The database record is deleted first. The Storage object is
    then removed. Ratings, downloads, and views should cascade
    through their configured foreign-key constraints.
    """

    resource = (
        db.query(Resource)
        .filter(Resource.resource_id == resource_id)
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    # Prevent students from deleting another student's resource.
    if resource.uploaded_by != current_user.roll_no:
        raise HTTPException(
            status_code=403,
            detail="You can only delete resources you uploaded",
        )

    object_path = resource.file_path

    try:
        # Reopen requests whose fulfilled resource is being deleted.
        linked_requests = (
            db.query(ResourceRequest)
            .filter(
                ResourceRequest.fulfilled_resource_id
                == resource.resource_id
            )
            .all()
        )

        for request in linked_requests:
            request.fulfilled_resource_id = None
            request.status = "OPEN"

        db.delete(resource)
        db.commit()

    except Exception as exc:
        db.rollback()
        print("RESOURCE DELETE DATABASE ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not delete the resource",
        )

    # Remove the actual file from the private Storage bucket.
    try:
        supabase.storage.from_(BUCKET_NAME).remove([object_path])

    except Exception as exc:
        # The database record is already deleted. Report the
        # cleanup failure rather than claiming full success.
        print("RESOURCE DELETE STORAGE ERROR:", repr(exc))
        return {
            "message": (
                "Resource deleted from the database, but its "
                "Storage file could not be removed."
            ),
            "resource_id": resource_id,
            "storage_cleanup": "failed",
        }

    return {
        "message": "Resource deleted successfully",
        "resource_id": resource_id,
        "storage_cleanup": "successful",
    }


# =========================================================
# 6. RATE A RESOURCE
# =========================================================


@router.post("/{resource_id}/rate")
def rate_resource(
    resource_id: int,
    data: RatingRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = (
        db.query(Resource)
        .filter(
            Resource.resource_id == resource_id,
            Resource.status == "ACCEPTED",
        )
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or unavailable",
        )

    existing_rating = (
        db.query(Rating)
        .filter(
            Rating.resource_id == resource_id,
            Rating.roll_no == current_user.roll_no,
        )
        .first()
    )

    try:
        if existing_rating:
            # Update the user's existing rating
            existing_rating.rating = data.rating

            db.commit()
            db.refresh(existing_rating)

            return {
                "message": "Rating updated successfully",
                "rating_id": existing_rating.rating_id,
            }

        # Create a new rating if one doesn't exist
        new_rating = Rating(
            resource_id=resource_id,
            roll_no=current_user.roll_no,
            rating=data.rating,
        )

        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)

        return {
            "message": "Rating added successfully",
            "rating_id": new_rating.rating_id,
        }

    except Exception as exc:
        db.rollback()
        print("RATING SAVE ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not save rating",
        )
