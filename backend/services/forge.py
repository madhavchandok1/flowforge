"""
Service layer for Forge business logic.

This module provides functions to handle business rules and workflows for Forge resources, acting as an intermediary between routers and repositories.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from models.forge import Forge
from schemas.forge import ForgeCreate, ForgeUpdate
from repositories.forge import (
    create_forge as repo_create_forge,
    get_forges as repo_get_forges,
    get_forge_by_id as repo_get_forge_by_id,
    update_forge as repo_update_forge,
    delete_forge as repo_delete_forge,
)


def create_forge(db: Session, forge_data: ForgeCreate) -> Forge:
    """
    Create a new Forge resource, applying any business rules if needed.
    Args:
        db (Session): SQLAlchemy database session.
        forge_data (ForgeCreate): Data for the new Forge.
    Returns:
        Forge: The created Forge ORM object.
    """
    # Example: Add business logic here (e.g., check for duplicate names)
    return repo_create_forge(db, forge_data)


def list_forges(db: Session) -> List[Forge]:
    """
    Retrieve all Forge resources.
    Args:
        db (Session): SQLAlchemy database session.
    Returns:
        List[Forge]: List of all Forge ORM objects.
    """
    return repo_get_forges(db)


def get_forge_by_id(db: Session, forge_id: str) -> Optional[Forge]:
    """
    Retrieve a Forge resource by its ID.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to retrieve.
    Returns:
        Optional[Forge]: The Forge ORM object if found, else None.
    """
    return repo_get_forge_by_id(db, forge_id)


def update_forge(db: Session, forge_id: str, forge_data: ForgeUpdate) -> Optional[Forge]:
    """
    Update an existing Forge resource, applying any business rules if needed.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to update.
        forge_data (ForgeUpdate): Data to update the Forge with.
    Returns:
        Optional[Forge]: The updated Forge ORM object if found, else None.
    """
    return repo_update_forge(db, forge_id, forge_data)


def delete_forge(db: Session, forge_id: str) -> bool:
    """
    Delete a Forge resource by its ID.
    Args:
        db (Session): SQLAlchemy database session.
        forge_id (str): The ID of the Forge to delete.
    Returns:
        bool: True if the Forge was deleted, False if not found.
    """
    return repo_delete_forge(db, forge_id) 