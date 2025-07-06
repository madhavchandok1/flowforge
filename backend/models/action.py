from sqlalchemy import Column, String, DateTime, Date, Boolean, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Action(Base):
    __tablename__ = "actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    module_id = Column(String, ForeignKey("modules.id"), nullable=False)
    blueprint_id = Column(String)
    forge_id = Column(String)

    title = Column(String, nullable=False)
    description = Column(Text)
    assignee_id = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    status = Column(String, default="queued")
    due_date = Column(Date)
    priority = Column(String)
    
    type = Column(String, default="task")
    severity = Column(String)
    reproducible = Column(Boolean)
    steps_to_reproduce = Column(JSON)
    attachments = Column(JSON)
    tags = Column(JSON)

    module = relationship("Module", back_populates="actions")
