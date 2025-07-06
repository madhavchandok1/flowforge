"""
SQLAlchemy model for the Forge resource.

Defines the database schema and ORM mapping for Forge, representing a project or workspace entity in the system.
Includes relationships, default values, and utility functions for unique ID generation.
"""

from sqlalchemy import Column, String, DateTime, Date, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from db.base import Base

def generate_uuid():
    """
    Generate a new UUID string.
    Purpose: Used as the default value for the primary key of Forge instances to ensure unique IDs.
    """
    return str(uuid.uuid4())

class Forge(Base):
    """
    SQLAlchemy ORM model for the 'forges' table.
    Purpose: Represents a Forge entity, which acts as a project or workspace containing blueprints, members, and metadata.
    Fields:
        - id: Primary key, unique identifier (UUID string)
        - name: Name of the forge (required)
        - description: Optional description of the forge
        - created_at: Timestamp when the forge was created
        - updated_at: Timestamp when the forge was last updated
        - owner_id: ID of the user who owns the forge
        - status: Status of the forge (default: 'active')
        - start_date: Optional project start date
        - end_date: Optional project end date
        - members: JSON field for member data
        - tags: JSON field for tags or labels
        - blueprints: Relationship to Blueprint entities
    """
    __tablename__ = "forges"

    id = Column(String, primary_key=True, default=generate_uuid,  nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text,  nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    owner_id = Column(String, nullable=False)
    status = Column(String, default="active", nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    members = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)

    blueprints = relationship("Blueprint", back_populates="forge", cascade="all, delete-orphan")
