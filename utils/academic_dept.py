import re

def get_department_code(roll_no:str):
    match=re.search(r"[A-Za-z]+",roll_no)

    if not match:
        raise ValueError("Invalid roll number")

    return match.group().upper()