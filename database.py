from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase

load_dotenv()
db_url = os.getenv("db_url")
engine = create_engine(db_url)

class Base(DeclarativeBase):
    pass