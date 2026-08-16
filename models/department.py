from sqlalchemy import BigInteger, Column, String
from database import Base
from sqlalchemy.orm import Mapped, mapped_column

class Department(Base):
    __tablename__ = "departments"

    department_code: Mapped[str] = mapped_column(String(10), primary_key=True)
    department_name: Mapped[str] = mapped_column(String(100), nullable=False)