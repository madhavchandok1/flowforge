"""
API router for Forge endpoints.

This module defines the HTTP endpoints for CRUD operations on Forge resources, using the service layer for business logic and database access.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import uuid4

from db.session import get_db
from schemas.forge import ForgeCreate, ForgeUpdate, ForgeOut
from models.forge import Forge
from services.forge import (
    create_forge as service_create_forge,
    list_forges as service_list_forges,
    get_forge_by_id as service_get_forge_by_id,
    update_forge as service_update_forge,
    delete_forge as service_delete_forge,
)

router = APIRouter(prefix="/forges", tags=["Forges"])

@router.post("/", response_model=ForgeOut)
def create_forge(forge: ForgeCreate, db: Session = Depends(get_db)) -> ForgeOut:
    """
    Create a new Forge resource.

    Args:
        forge (ForgeCreate): The Forge data to create.
        db (Session): SQLAlchemy database session (provided by dependency).

    Returns:
        ForgeOut: The created Forge resource.
    """
    db_forge = service_create_forge(db, forge)
    return db_forge

@router.get("/", response_model=List[ForgeOut])
def list_forges(db: Session = Depends(get_db)) -> List[Forge]:
    """
    Retrieve all Forge resources.

    Args:
        db (Session): SQLAlchemy database session (provided by dependency).

    Returns:
        List[Forge]: List of all Forge resources.
    """
    return service_list_forges(db)

@router.get("/{forge_id}", response_model=ForgeOut)
def get_forge(forge_id: str, db: Session = Depends(get_db)) -> ForgeOut:
    """
    Retrieve a Forge resource by its ID.

    Args:
        forge_id (str): The ID of the Forge to retrieve.
        db (Session): SQLAlchemy database session (provided by dependency).

    Returns:
        ForgeOut: The requested Forge resource.

    Raises:
        HTTPException: If the Forge is not found.
    """
    forge = service_get_forge_by_id(db, forge_id)
    if not forge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forge not found")
    return forge

@router.put("/{forge_id}", response_model=ForgeOut)
def update_forge(forge_id: str, forge_data: ForgeUpdate, db: Session = Depends(get_db)) -> ForgeOut:
    """
    Update an existing Forge resource.

    Args:
        forge_id (str): The ID of the Forge to update.
        forge_data (ForgeUpdate): The updated Forge data.
        db (Session): SQLAlchemy database session (provided by dependency).

    Returns:
        ForgeOut: The updated Forge resource.

    Raises:
        HTTPException: If the Forge is not found.
    """
    forge = service_update_forge(db, forge_id, forge_data)
    if not forge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forge not found")
    return forge

@router.delete("/{forge_id}")
def delete_forge(forge_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Delete a Forge resource by its ID.

    Args:
        forge_id (str): The ID of the Forge to delete.
        db (Session): SQLAlchemy database session (provided by dependency).

    Returns:
        Dict[str, Any]: A message indicating the result of the deletion.

    Raises:
        HTTPException: If the Forge is not found.
    """
    success = service_delete_forge(db, forge_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forge not found")
    return {"detail": "Forge deleted"}
