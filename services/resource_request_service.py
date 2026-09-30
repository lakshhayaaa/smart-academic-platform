from sqlalchemy.orm import Session
from models.resource_request import ResourceRequest
from schemas.resource_requests import ResourceRequestCreate, ResourceRequestResponse

def create_resource_requests(db: Session, data: ResourceRequestCreate, requested_by: str) :
    resource_request = ResourceRequest(
        requested_by=requested_by,
        course_code=data.course_code,
        unit_number=data.unit_number,
        resource_type=data.resource_type,
        status='OPEN'
    )
    db.add(resource_request)
    db.commit()
    db.refresh(resource_request)
    return resource_request

def get_resource_requests(db: Session):
    return db.query(ResourceRequest).all()