from fastapi import FastAPI
from database import engine

from routes.resources import router as resource_router
from routes.comments import router as comments_router
from routes.ranking import router as ranking_router
from routes.auth import router as auth_router

from routes.resource_request import router as resource_request_router
app = FastAPI()

app.include_router(resource_router)
app.include_router(comments_router)
app.include_router(ranking_router)
app.include_router(auth_router)
app.include_router(resource_request_router)


@app.get("/")
def get_root():
    try:
        with engine.connect():
            return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {str(e)}"}