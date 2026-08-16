from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    String,
    func
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class View(Base):
    __tablename__ = "views"

    view_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    resource_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "resources.resource_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    roll_no: Mapped[str | None] = mapped_column(
        String(30),
        ForeignKey(
            "users.roll_no",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    viewed_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )