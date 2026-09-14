import hashlib
from sqlalchemy.orm import Session
from models.resouce import Resource


def calculate_file_hash(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:

        while chunk := file.read(4096):
            sha256.update(chunk)

    return sha256.hexdigest()


def is_duplicate(file_hash, db: Session):

    existing_resource = (
        db.query(Resource)
        .filter(Resource.file_hash == file_hash)
        .first()
    )

    return existing_resource is not None