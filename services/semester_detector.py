import re


def detect_semester(text):

    patterns = [
        r"\b(\d+)(?:st|nd|rd|th|[\"“”])?\s+semester\b",
        r"\bsemester\s*[-:]?\s*(\d+)\b",
        r"\bsem(?:ester)?\s*[-:]?\s*(\d+)\b",
        r"\bsemester\s+([ivx]+)\b"
    ]

    for pattern in patterns:

        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            semester = match.group(1)

            if semester.isdigit():
                return int(semester)

            roman = {
                "i": 1,
                "ii": 2,
                "iii": 3,
                "iv": 4,
                "v": 5,
                "vi": 6,
                "vii": 7,
                "viii": 8
            }

            return roman.get(semester.lower())

    return None