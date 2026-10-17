import hashlib
from sqlalchemy.orm import Session
from models.resouce import Resource



def calculate_file_hash(file_bytes: bytes)-> str:
    return hashlib.sha256(file_bytes).hexdigest()



def is_duplicate(file_hash:str, db: Session):

    existing_resource = (
        db.query(Resource)
        .filter(Resource.file_hash == file_hash)
        .first()
    )

    return existing_resource is not None