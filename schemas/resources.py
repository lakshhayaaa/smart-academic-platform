from pydantic import BaseModel
from datetime import datetime

from enum import Enum

class ResourceTypeEnum(str, Enum):
    PPT = "PPT"
    NOTES = "NOTES"
    PYQ = "PYQ"

class ResourceUploadRequest(BaseModel):
    title: str
    course_code: str
    unit_number: int
    resource_type: ResourceTypeEnum


class ResourceUploadResponse(BaseModel):
    resource_id: int
    title: str
    course_code: str
    unit_number: int
    resource_type: str
    status: str
    created_at: datetime