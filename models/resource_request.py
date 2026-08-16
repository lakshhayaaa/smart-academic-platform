from datetime import datetime

from sqlalchemy import BigInteger, String, DateTime, ForeignKey,ForeignKeyConstraint, SmallInteger, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

class ResourceRequest(Base):
    __tablename__ = "resource_requests"

    request_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    requested_by: Mapped[str] = mapped_column(
        String(30),
        ForeignKey("users.roll_no"),
        nullable=False
    )

    course_code:Mapped[str]=mapped_column(
        String(30),
        nullable=False
    )

    unit_number:Mapped[int]=mapped_column(
        SmallInteger,
        nullable=False
    )

    resource_type: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("resource_types.type_name"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING"
    )

    fulfilled_resource_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("resources.resource_id",ondelete="SET NULL"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    table_args = (
        ForeignKeyConstraint(
            ["course_code", "unit_number"],
            ["units.course_code", "units.unit_number"],
            ondelete="CASCADE"
        ),
    )