from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class ResourceType(Base):
    __tablename__ = "resource_types"

    type_name: Mapped[str] = mapped_column(String(50), primary_key=True)