from fastapi import APIRouter

router=APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/signup")
async def signup():
    return {"message": "Sign-up endpoint"}

@router.post("/signin")
async def signin():
    return {"message": "Sign-in endpoint"}

@router.post("/signout")
async def signout():
    return {"message": "Sign-out endpoint"}