import fitz
from pptx import Presentation


def extract_pdf_text(file_path):

    document = fitz.open(file_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def extract_ppt_text(file_path):

    presentation = Presentation(file_path)

    text = ""

    for slide in presentation.slides:

        for shape in slide.shapes:

            if hasattr(shape, "text"):
                text += shape.text + "\n"

    return text