import os


ALLOWED_EXTENSIONS = [".pdf", ".pptx",".docx"]


def validate_file(filename: str) -> bool:
    extension = "." + filename.lower().rsplit(".", 1)[-1]

    return extension in ALLOWED_EXTENSIONS