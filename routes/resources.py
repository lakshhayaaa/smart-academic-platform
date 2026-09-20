from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel

import os
import shutil
import tempfile

from sqlalchemy.orm import Session

from database import get_db
from models.resouce import Resource
from models.rating import Rating
from models.download import Download

from services.resource_processor import process_resource


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


class RatingRequest(BaseModel):
    roll_no: str
    rating: int


@router.get("/search")
def search_resources():
    return {
        "message": "Search resources endpoint"
    }


@router.get("/{resource_id}")
def view_resource(resource_id: int):
    return {
        "message": f"View resource with ID {resource_id} endpoint"
    }


@router.get("/{resource_id}/download")
def download_resource(
    resource_id: int,
    roll_no: str,
    db: Session = Depends(get_db)
):
    new_download = Download(
        resource_id=resource_id,
        roll_no=roll_no
    )

    db.add(new_download)
    db.commit()
    db.refresh(new_download)

    return {
        "message": "Download recorded successfully",
        "download_id": new_download.download_id
    }


@router.post("/upload")
def upload_resource(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    suffix = os.path.splitext(file.filename)[1]

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    )

    temp_path = temp_file.name
    temp_file.close()

    try:

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = process_resource(temp_path)

        if "error" in result:
            return result

        if not result.get("course_code"):
            return {
                "error": "Course code could not be detected from the file"
            }

        if not result.get("unit"):
            return {
                "error": "Unit number could not be detected from the file"
            }

        if not result.get("resource_type"):
            return {
                "error": "Resource type could not be detected from the file"
            }

        result["filename"] = file.filename

        return result

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.delete("/{resource_id}")
def delete_resource(resource_id: int):
    return {
        "message": f"Delete resource with ID {resource_id} endpoint"
    }


@router.post("/{resource_id}/rate")
def rate_resource(
    resource_id: int,
    data: RatingRequest,
    db: Session = Depends(get_db)
):

    if data.rating < 1 or data.rating > 5:
        return {
            "error": "Rating must be between 1 and 5"
        }

    new_rating = Rating(
        resource_id=resource_id,
        roll_no=data.roll_no,
        rating=data.rating
    )

    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    return {
        "message": "Rating added successfully",
        "rating_id": new_rating.rating_id
    }