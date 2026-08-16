from datetime import datetime

from sqlalchemy import BigInteger, DateTime,ForeignKey, ForeignKeyConstraint, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Resource(Base):
    __tablename__="resources"

    resource_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )
    title: Mapped[str]=mapped_column(
        String(255),
        nullable=False
    )

    file_path: Mapped[str]=mapped_column(
        Text,
        nullable=False
    )

    file_hash: Mapped[str]=mapped_column(
        String(64),
        nullable=False,
        unique=True
    )

    course_code: Mapped[str]=mapped_column(
        String(30),
        nullable=False
    )

    unit_number: Mapped[int]=mapped_column(
        SmallInteger,
        nullable=False
    )

    resource_type: Mapped[str]=mapped_column(
        String(50),
        ForeignKey("resource_types.type_name"),
        nullable=False
    )

    uploaded_by: Mapped[str]=mapped_column(
        String(30),
        ForeignKey("users.roll_no"),
        nullable=True
    )

    status: Mapped[str]=mapped_column(
        String(20),
        nullable=False,
        default="PENDING"
    )

    created_at: Mapped[datetime]=mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["course_code", "unit_number"],
            ["units.course_code", "units.unit_number"]
        ), 
    )