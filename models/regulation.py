from sqlalchemy import SmallInteger
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Regulation(Base):
    __tablename__ = "regulations"

    regulation_year:Mapped[int]=mapped_column(SmallInteger, primary_key=True)