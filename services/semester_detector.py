import re


def detect_semester(text):

    patterns = [
        # Example: 4th semester, 4th Semester, 4" Semester
        r"\b(\d+)(?:st|nd|rd|th|[\"“”])?\s+semester\b",

        # Example: Semester 4, Semester-4, Semester: 4
        r"\bsemester\s*[-:]?\s*(\d+)\b",

        # Example: Sem 4, SEM-4, SEM: 4
        r"\bsem(?:ester)?\s*[-:]?\s*(\d+)\b",

        # Example: Semester IV
        r"\bsemester\s+([ivx]+)\b",

        # OCR format from your PDF:
        # CSE AI & ML, 04
        r"\bCSE\s*(?:AI\s*&\s*ML)?\s*[,;-]\s*0?([1-8])\b"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            semester = match.group(1)

            if semester.isdigit():
                semester = int(semester)

                if 1 <= semester <= 8:
                    return semester

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