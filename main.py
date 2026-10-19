from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine

from routes.resources import router as resource_router
from routes.comments import router as comments_router
from routes.ranking import router as ranking_router
from routes.auth import router as auth_router

from routes.resource_request import router as resource_request_router
from routes.academic import router as academic_router
from routes.dashboard import router as dashboard_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://smart-academic-platform-woad.vercel.app",
        "https://smart-academic-platform-pa0mf0nbp-24n224-9179s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resource_router)
app.include_router(comments_router)
app.include_router(ranking_router)
app.include_router(auth_router)
app.include_router(resource_request_router)
app.include_router(academic_router)
app.include_router(dashboard_router)

@app.get("/")
def get_root():
    try:
        with engine.connect():
            return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {str(e)}"}