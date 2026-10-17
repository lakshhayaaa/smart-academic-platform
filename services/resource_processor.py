from sqlalchemy.orm import Session

from services.file_validator import validate_file
from services.file_processor import process_file
from services.quality_checker import check_quality
from services.duplicate_checker import (
    calculate_file_hash,
    is_duplicate
)


def process_resource(
    filename: str,
    file_bytes: bytes,
    db: Session
):

    # 1. Validate file type
    if not validate_file(filename):
        return {"error": "Invalid file type"}

    # 2. Calculate file hash
    file_hash = calculate_file_hash(file_bytes)

    # 3. Check for duplicate
    if is_duplicate(file_hash, db):
        return {"error": "Duplicate resource"}

    # 4. Extract text
    text = process_file(filename, file_bytes)

    # 5. Check quality
    if not check_quality(text):
        return {"error": "Low quality or unreadable file"}

    # 6. Return processed information
    return {
        "file_hash": file_hash,
        "text": text
    }