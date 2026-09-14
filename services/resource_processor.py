from services.file_validator import validate_file
from services.file_processor import process_pdf
from services.text_extractor import extract_ppt_text
from services.quality_checker import check_quality
from services.duplicate_checker import calculate_file_hash
from services.auto_tager import (
    detect_course_code,
    detect_unit,
    detect_resource_type
)


def process_resource(file_path):

    # 1. Validate the file
    if not validate_file(file_path):
        return {"error": "Invalid file"}

    # 2. Extract text
    text = ""

    extension = file_path.lower()

    if extension.endswith(".pdf"):
        text = process_pdf(file_path)

    elif extension.endswith(".pptx"):
        text = extract_ppt_text(file_path)

    # 3. Check quality
    if not check_quality(text):
        return {"error": "Low quality or unreadable file"}

    # 4. Calculate file hash
    file_hash = calculate_file_hash(file_path)

    # 5. Automatically detect tags
    course_code = detect_course_code(text)
    unit = detect_unit(text)
    resource_type = detect_resource_type(text)

    # 6. Return all processed information
    return {
        "file_path": file_path,
        "file_hash": file_hash,
        "course_code": course_code,
        "unit": unit,
        "resource_type": resource_type,
        "text": text
    }