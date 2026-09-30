from fastapi import APIRouter, Depends
from database import get_db
from schemas.resource_requests import ResourceRequestCreate, ResourceRequestResponse
from utils.dependencies import get_current_user
from sqlalchemy.orm import Session
from models.user import User
from services.resource_request_service import create_resource_requests, get_resource_requests
router=APIRouter(
    prefix="/resource-requests",
    tags=["Resource Requests"]
)

@router.post("", response_model=ResourceRequestResponse)
def create_request(data: ResourceRequestCreate,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    created_request = create_resource_requests(db, data, current_user.roll_no)
    return created_request

@router.get("", response_model=list[ResourceRequestResponse])
def get_requests(db: Session = Depends(get_db)):
    return get_resource_requests(db)
