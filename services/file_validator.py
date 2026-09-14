import os


ALLOWED_EXTENSIONS = [".pdf", ".pptx"]


def validate_file(file_path):

    if not os.path.exists(file_path):
        return False

    extension = os.path.splitext(file_path)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return False

    return True