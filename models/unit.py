from sqlalchemy import ForeignKey, SmallInteger,String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Unit(Base):
    __tablename__="units"

    course_code:Mapped[str]=mapped_column(String(30),ForeignKey("subjects.course_code"),primary_key=True)
    unit_number:Mapped[int]=mapped_column(SmallInteger,primary_key=True)
    unit_name:Mapped[str]=mapped_column(String(150),nullable=False)
    