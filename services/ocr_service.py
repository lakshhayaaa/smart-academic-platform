import io

import pytesseract
from PIL import Image


def extract_ocr_text(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image)

    return text