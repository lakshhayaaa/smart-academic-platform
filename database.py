from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()
db_url = os.getenv("db_url")
engine = create_engine(db_url)

class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()