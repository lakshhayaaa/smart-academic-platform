from datetime import datetime

from sqlalchemy import ForeignKey, String, SmallInteger, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class User(Base):
    __tablename__ = "users"

    roll_no: Mapped[str] = mapped_column(
        String(30),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    college_email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    department_code: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("departments.department_code"),
        nullable=False
    )

    regulation_year: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("regulations.regulation_year"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )