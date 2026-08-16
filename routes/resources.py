from fastapi import APIRouter

router=APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

@router.get("/search")
def search_resources():
    return {"message": "Search resources endpoint"}

@router.get("/{resource_id}")
def view_resource(resource_id: int):
    return {"message": f"View resource with ID {resource_id}"}

@router.get("/{resource_id}/download")
def download_resource(resource_id: int):
    return {"message": f"Download resource with ID {resource_id}"}

@router.post("/upload")
def upload_resource():
    return {"message": "Upload resource endpoint"}  

@router.delete("/{resource_id}")
def delete_resource(resource_id: int):
    return {"message": f"Delete resource with ID {resource_id} endpoint"}

@router.post("/{resource_id}/rate") 
def rate_resource(resource_id: int):
    return {"message": f"Rate resource with ID {resource_id} endpoint"}
