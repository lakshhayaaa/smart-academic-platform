import re


def check_quality(text):

    text = text.strip()

    if len(text) < 100:
        return False

    words = re.findall(r"[A-Za-z]+", text)

    if len(words) < 20:
        return False

    return True