from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ResourceRequestCreate(BaseModel):
    course_code: str
    unit_number: int
    resource_type: str

class ResourceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    requested_by: str
    course_code: str
    unit_number: int
    resource_type: str
    status: str
    fulfilled_resource_id: int | None
    created_at: datetime