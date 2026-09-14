import re


def detect_unit(text):

    patterns = [
        r"unit\s*[-:]?\s*(\d+)",
        r"unit\s+([ivx]+)",
        r"module\s*[-:]?\s*(\d+)"
    ]

    for pattern in patterns:

        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            unit = match.group(1)

            if unit.isdigit():
                return int(unit)

            roman = {
                "i": 1,
                "ii": 2,
                "iii": 3,
                "iv": 4,
                "v": 5
            }

            return roman.get(unit.lower())

    return None


def detect_resource_type(text):

    text = text.lower()

    if "previous year" in text or "pyq" in text:
        return "PYQ"

    if "question paper" in text or "assessment test" in text:
        return "PYQ"

    if "ppt" in text or "presentation" in text or "slides" in text:
        return "PPT"

    if "notes" in text or "lecture notes" in text:
        return "Notes"

    return None


def detect_course_code(text):

    pattern = r"\b\d{2}[A-Z]\d{3}\b"

    match = re.search(pattern, text)

    if match:
        return match.group()

    return None


def get_subject_name(course_code, db):

    from models.subjects import Subject

    subject = (
        db.query(Subject)
        .filter(Subject.course_code == course_code)
        .first()
    )

    if subject:
        return subject.course_name

    return None