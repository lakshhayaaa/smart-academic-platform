from fastapi import FastAPI
from database import engine

from routes.resources import router as resource_router

app = FastAPI()

app.include_router(resource_router)


@app.get("/")
def get_root():
    try:
        with engine.connect():
            return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {str(e)}"}