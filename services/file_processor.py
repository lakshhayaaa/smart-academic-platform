import os
import tempfile

import fitz
from PIL import Image

from services.text_extractor import extract_pdf_text
from services.ocr_service import extract_ocr_text


def process_pdf(file_path):

    text = extract_pdf_text(file_path)

    if len(text.strip()) > 100:
        return text

    document = fitz.open(file_path)

    full_text = ""

    for page in document:

        pixmap = page.get_pixmap(
            dpi=200,
            colorspace=fitz.csRGB,
            alpha=False
        )

        image = Image.frombytes(
            "RGB",
            [pixmap.width, pixmap.height],
            pixmap.samples
        )

        temp_file = tempfile.NamedTemporaryFile(
            suffix=".png",
            delete=False
        )

        image_path = temp_file.name
        temp_file.close()

        try:
            image.save(image_path)

            page_text = extract_ocr_text(image_path)

            full_text += page_text + "\n"

        finally:
            if os.path.exists(image_path):
                os.remove(image_path)

    document.close()

    return full_text