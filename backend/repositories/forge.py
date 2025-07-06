"""
Repository layer for Forge database operations.

This module provides functions to interact with the database for CRUD operations on the Forge model. It abstracts direct database access from the service and router layers.
"""

from sqlalchemy.orm import Session
from uuid import uuid4
from typing import List, Optional
from models.forge import Forge
from schemas.forge import ForgeCreate, ForgeUpdate

def create_forge(db: Session, forge_data: ForgeCreate) -> Forge:
    """
    Create a new Forge record in the database.
    Args:
        db (Session): SQLAlchemy database session.
        forge_data (ForgeCreate): Data for the new Forge.
    Returns:
        Forge: The created Forge ORM object.
    """
    new_forge = Forge(
        id=str(uuid4()),
        name=forge_data.name,
        description=forge_data.description,
        owner_id=forge_data.owner_id,
        status=forge_data.status,
        start_date=forge_data.start_date,
        end_date=forge_data.end_date,
        members=forge_data.members,
        tags=forge_data.tags,
    )
    db.add(new_forge)
    db.commit()
    db.refresh(new_forge)
    return new_forge


def get_forges(db: Session) -> List[Forge]:
    """
    Retrieve all Forge records from the database.
    Args:
        db (Session): SQLAlchemy database session.
    Returns:
        List[Forge]: List of all Forge ORM objects.
    """
    return db.query(Forge).all()


def get_forge_by_id(db: Session, forge_id: str) -> Optional[Forge]:
    """
    Retrieve a Forge record by its ID.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to retrieve.
    Returns:
        Optional[Forge]: The Forge ORM object if found, else None.
    """
    return db.query(Forge).filter(Forge.id == forge_id).first()


def update_forge(db: Session, forge_id: str, forge_data: ForgeUpdate) -> Optional[Forge]:
    """
    Update an existing Forge record with new data.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to update.
        forge_data (ForgeUpdate): Data to update the Forge with.
    Returns:
        Optional[Forge]: The updated Forge ORM object if found, else None.
    """
    forge = get_forge_by_id(db, forge_id)
    if not forge:
        return None

    for key, value in forge_data.model_dump(exclude_unset=True).items():
        setattr(forge, key, value)

    db.commit()
    db.refresh(forge)
    return forge


def delete_forge(db: Session, forge_id: str) -> bool:
    """
    Delete a Forge record from the database by its ID.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to delete.
    Returns:
        bool: True if the Forge was deleted, False if not found.
    """
    forge = get_forge_by_id(db, forge_id)
    if not forge:
        return False

    db.delete(forge)
    db.commit()
    return True
