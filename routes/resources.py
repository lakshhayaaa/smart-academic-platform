from fastapi import APIRouter, UploadFile, File
import os
import shutil
import tempfile

from services.resource_processor import process_resource


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


@router.get("/search")
def search_resources():
    return {"message": "Search resources endpoint"}


@router.get("/{resource_id}")
def view_resource(resource_id: int):
    return {"message": f"View resource with ID {resource_id}"}


@router.get("/{resource_id}/download")
def download_resource(resource_id: int):
    return {"message": f"Download resource with ID {resource_id}"}


@router.post("/upload")
def upload_resource(file: UploadFile = File(...)):

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

        result["filename"] = file.filename

        return result

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.delete("/{resource_id}")
def delete_resource(resource_id: int):
    return {"message": f"Delete resource with ID {resource_id} endpoint"}


@router.post("/{resource_id}/rate")
def rate_resource(resource_id: int):
    return {"message": f"Rate resource with ID {resource_id} endpoint"}