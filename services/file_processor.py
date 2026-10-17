import io

import fitz
from PIL import Image

from services.text_extractor import (
    extract_pdf_text,
    extract_docx_text,
    extract_ppt_text
)
from services.ocr_service import extract_ocr_text


def process_file(filename: str, file_bytes: bytes) -> str:

    extension = "." + filename.lower().rsplit(".", 1)[-1]

    # PDF
    if extension == ".pdf":

        text = extract_pdf_text(file_bytes)

        # Normal PDF with selectable text
        if len(text.strip()) > 100:
            return text

        # Scanned PDF → OCR
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

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

            image_buffer = io.BytesIO()
            image.save(image_buffer, format="PNG")

            page_text = extract_ocr_text(
                image_buffer.getvalue()
            )

            full_text += page_text + "\n"

        document.close()

        return full_text

    # DOCX
    elif extension == ".docx":
        return extract_docx_text(file_bytes)

    # PPTX
    elif extension == ".pptx":
        return extract_ppt_text(file_bytes)

    return ""