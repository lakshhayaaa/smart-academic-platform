from fastapi import APIRouter

router=APIRouter(
    prefix="/resource-requests",
    tags=["Resource Requests"]
)

@router.post("")
def create_resource_request():
    return {"message": "Create resource request endpoint"}

@router.get("")
def get_resource_requests():
    return {"message": "Get resource requests endpoint"}
