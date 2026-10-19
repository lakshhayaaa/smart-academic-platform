
import uuid
from pathlib import Path
from mimetypes import guess_type

from sqlalchemy.orm import Session

from models.resouce import Resource
from models.resource_request import ResourceRequest
from services.resource_processor import process_resource
from services.academic_service import validate_academic_selection
from supabase_client import supabase


BUCKET_NAME = "academic-resources"
ALLOWED_EXTENSIONS = {".pdf", ".pptx", ".docx"}


def upload_resource(
    *,
    title: str,
    department_code: str,
    regulation_year: int,
    semester_number: int,
    course_code: str,
    unit_number: int,
    resource_type: str,
    filename: str,
    file_bytes: bytes,
    uploaded_by: str,
    db: Session,
):
    """Validate, upload, save, and fulfill matching requests."""

    # 1. Validate required input.
    if not title or not title.strip():
        return {
            "success": False,
            "error": "INVALID_TITLE",
            "message": "Resource title cannot be empty.",
        }

    if not file_bytes:
        return {
            "success": False,
            "error": "EMPTY_FILE",
            "message": "Uploaded file is empty.",
        }

    # 2. Validate academic details.
    academic_check = validate_academic_selection(
        department_code=department_code,
        regulation_year=regulation_year,
        semester_number=semester_number,
        course_code=course_code,
        unit_number=unit_number,
        db=db,
    )

    if not academic_check["success"]:
        return academic_check

    # 3. Validate filename and file type.
    safe_filename = Path(filename or "upload").name
    extension = Path(safe_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        return {
            "success": False,
            "error": "INVALID_FILE_TYPE",
            "message": "Upload a PDF, PPTX, or DOCX file.",
        }

    # 4. Process the file and detect duplicates.
    try:
        result = process_resource(
            safe_filename,
            file_bytes,
            db,
        )
    except Exception as exc:
        print("FILE PROCESSING ERROR:", repr(exc))
        return {
            "success": False,
            "error": "FILE_PROCESSING_FAILED",
            "message": (
                "The file could not be processed. "
                "Check that it is valid and readable."
            ),
        }

    if result.get("error"):
        error = result["error"]
        return {
            "success": False,
            "error": error,
            "message": error,
        }

    file_hash = result["file_hash"]

    # 5. Generate a unique Storage object path.
    object_path = (
        f"{course_code}/{unit_number}/{resource_type}/"
        f"{uuid.uuid4().hex}{extension}"
    )

    content_type = (
        guess_type(safe_filename)[0]
        or "application/octet-stream"
    )

    storage_uploaded = False
    stage = "Supabase Storage upload"

    try:
        # 6. Upload the file to Supabase Storage.
        print("UPLOAD DEBUG: Starting Storage upload")

        supabase.storage.from_(BUCKET_NAME).upload(
            path=object_path,
            file=file_bytes,
            file_options={
                "content-type": content_type,
                "upsert": "false",
            },
        )

        storage_uploaded = True
        print("UPLOAD DEBUG: Storage upload successful")

        # 7. Create the resource record.
        stage = "PostgreSQL insert and commit"

        resource = Resource(
            title=title.strip(),
            file_path=object_path,
            file_hash=file_hash,
            course_code=course_code,
            unit_number=unit_number,
            resource_type=resource_type,
            uploaded_by=uploaded_by,
            status="ACCEPTED",
        )

        db.add(resource)

        # Generate the resource ID before linking requests.
        db.flush()

        # 8. Fulfill matching requests from other students.
        stage = "Matching resource requests"

        matching_requests = (
            db.query(ResourceRequest)
            .filter(
                ResourceRequest.course_code == resource.course_code,
                ResourceRequest.unit_number == resource.unit_number,
                ResourceRequest.resource_type == resource.resource_type,
                ResourceRequest.requested_by != uploaded_by,
                ResourceRequest.status.in_(["OPEN", "PENDING"]),
            )
            .all()
        )

        for request in matching_requests:
            request.status = "FULFILLED"
            request.fulfilled_resource_id = resource.resource_id

        print(
            "UPLOAD DEBUG: Matching requests fulfilled:",
            len(matching_requests),
        )

        # Save the resource and request updates together.
        db.commit()
        print("UPLOAD DEBUG: Database commit successful")

        # 9. Refresh the saved resource.
        stage = "Database refresh"
        db.refresh(resource)

        return {
            "success": True,
            "resource": resource,
        }

    except Exception as exc:
        db.rollback()

        print(f"UPLOAD DEBUG: Failed during {stage}")
        print(
            "UPLOAD DEBUG: Exception type:",
            type(exc).__name__,
        )
        print(
            "UPLOAD DEBUG: Exception details:",
            repr(exc),
        )

        # Remove the Storage file if the database operation failed.
        if storage_uploaded:
            try:
                supabase.storage.from_(BUCKET_NAME).remove(
                    [object_path]
                )
                print(
                    "UPLOAD DEBUG: Storage cleanup successful"
                )
            except Exception as cleanup_error:
                print(
                    "UPLOAD DEBUG: Storage cleanup failed:",
                    repr(cleanup_error),
                )

        return {
            "success": False,
            "error": "RESOURCE_SAVE_FAILED",
            "message": (
                "Could not save the resource. Please try again."
            ),
        }
