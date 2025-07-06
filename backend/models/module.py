from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True, default=generate_uuid)
    blueprint_id = Column(String, ForeignKey("blueprints.id"), nullable=False)
    forge_id = Column(String, ForeignKey("forges.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    owner_id = Column(String)
    status = Column(String, default="queued")
    story_points = Column(Integer)
    priority = Column(String)
    acceptance_criteria = Column(JSON)
    tags = Column(JSON)

    blueprint = relationship("Blueprint", back_populates="modules")
    actions = relationship("Action", back_populates="module", cascade="all, delete-orphan")
