from sqlalchemy import ForeignKey, SmallInteger,String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Subject(Base):
    __tablename__="subjects"

    course_code:Mapped[str]=mapped_column(String(30),primary_key=True)
    course_name:Mapped[str]=mapped_column(String(150),nullable=False)
    department_code:Mapped[str]=mapped_column(String(10),ForeignKey("departments.department_code"),nullable=False)
    regulation_year:Mapped[int]=mapped_column(SmallInteger,ForeignKey("regulations.regulation_year"),nullable=False)
    semester_number:Mapped[int]=mapped_column(SmallInteger,nullable=False)