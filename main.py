from fastapi import FastAPI
from database import engine

app=FastAPI()

@app.get("/")
def get_root():
    try:
        with engine.connect():
            return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {str(e)}"}
    