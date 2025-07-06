from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Blueprint(Base):
    __tablename__ = "blueprints"

    id = Column(String, primary_key=True, default=generate_uuid)
    forge_id = Column(String, ForeignKey("forges.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    owner_id = Column(String)
    status = Column(String, default="queued")  # queued, forging, jammed, crafted
    start_date = Column(Date)
    end_date = Column(Date)
    priority = Column(String)
    tags = Column(JSON)

    forge = relationship("Forge", back_populates="blueprints")
    modules = relationship("Module", back_populates="blueprint", cascade="all, delete-orphan")
