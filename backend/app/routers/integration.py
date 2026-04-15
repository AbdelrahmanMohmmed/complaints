"""API integration management routes - create, list, update, delete integrations.

Handles connections to external feedback sources (Facebook, Twitter, WhatsApp).
Includes credential validation, encryption, and role-based access control.
"""

import httpx
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import database, models, oauth2, utils
from ..schemas import integration

router = APIRouter(prefix="/integrations", tags=["Integrations"])


# ============================================================================
# Configuration & Authorization
# ============================================================================

# Platform API endpoints
BASE_URLS = {
    "facebook": "https://graph.facebook.com",
    "twitter": "https://api.twitter.com/2",
    "whatsapp": "https://graph.facebook.com/v17.0",
}

# Role-based access control
ALLOWED_ROLES_MANAGE = [1, 2]  # Manager (1) and Tech Admin (2)
ALLOWED_ROLES_VIEW = [1, 2]  # Manager (1) and Tech Admin (2)


# ============================================================================
# Helper Functions
# ============================================================================


async def validate_api_credentials(channel_name: str, api_key: str) -> bool:
    """Validate API credentials against the real platform API.

    Tests credentials by making a simple API call to each platform's
    authentication endpoint.

    Args:
        channel_name: Platform name (facebook, twitter, whatsapp)
        api_key: API key to validate

    Returns:
        True if credentials are valid, False otherwise
    """
    try:
        if channel_name == "facebook":
            # Facebook: GET /me with access_token param
            url = f"{BASE_URLS['facebook']}/me"
            params = {"access_token": api_key}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
                return response.status_code == 200

        elif channel_name == "twitter":
            # Twitter: GET /users/me with Bearer token
            url = f"{BASE_URLS['twitter']}/users/me"
            headers = {"Authorization": f"Bearer {api_key}"}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers)
                return response.status_code == 200

        elif channel_name == "whatsapp":
            # WhatsApp: GET /me with Bearer token
            url = f"{BASE_URLS['whatsapp']}/me"
            headers = {"Authorization": f"Bearer {api_key}"}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers)
                return response.status_code == 200

        return False

    except httpx.RequestError:
        # Connection error
        return False
    except Exception as e:
        print(f"Error validating credentials: {e}")
        return False


# ============================================================================
# Create Integration
# ============================================================================


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=integration.IntegrationOut
)
async def create_integration(
    integration_data: integration.IntegrationCreate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> models.Api:
    """Create a new API integration for the company.

    Validates credentials against the real platform API before saving.
    Encrypts api_key before storage. Prevents duplicate integrations per channel.

    Args:
        integration_data: Integration creation schema
        current_user: Current user with company info
        db: Database session

    Returns:
        Created integration object (IntegrationOut schema)

    Raises:
        HTTPException: 403 if user role not authorized
        HTTPException: 400 if channel invalid or credentials invalid
        HTTPException: 409 if integration already exists for channel
    """
    # RBAC: Only Manager (1) and Tech Admin (2) can create
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can create integrations"
        )

    company_id = current_user["company_id"]
    channel_name = integration_data.channel_name
    api_key = integration_data.api_key

    # Validate channel name
    if channel_name not in BASE_URLS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid channel. Must be one of: {', '.join(BASE_URLS.keys())}"
        )

    # Check for duplicate integration
    existing = db.query(models.Api).filter(
        models.Api.company_id == company_id,
        models.Api.channel_name == channel_name,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Integration for {channel_name} already configured"
        )

    # Validate credentials with platform
    is_valid = await validate_api_credentials(channel_name, api_key)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {channel_name} credentials"
        )

    # Encrypt api_key before storage
    encrypted_key = utils.encrypt_api_key(api_key)

    # Create integration record
    try:
        new_integration = models.Api(
            company_id=company_id,
            channel_name=channel_name,
            api_key=encrypted_key,
            api_base_url=BASE_URLS[channel_name],
            status="active",
        )
        db.add(new_integration)
        db.commit()
        db.refresh(new_integration)
        return new_integration

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create integration"
        )
    except Exception as e:
        db.rollback()
        print(f"Error creating integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error creating integration"
        )


# ============================================================================
# List Integrations
# ============================================================================


@router.get("/", response_model=List[integration.IntegrationOut])
def list_integrations(
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> list[models.Api]:
    """List all integrations for the authenticated company.

    Manager (1) and Tech Admin (2) only. Never returns raw api_key.

    Args:
        current_user: Current user with company info
        db: Database session

    Returns:
        List of integrations for the company (IntegrationOut schema)

    Raises:
        HTTPException: 403 if user role not authorized
    """
    # RBAC: Only Manager and Tech Admin can view
    if current_user["role_id"] not in ALLOWED_ROLES_VIEW:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view integrations"
        )

    company_id = current_user["company_id"]

    return db.query(models.Api).filter(
        models.Api.company_id == company_id
    ).all()


# ============================================================================
# Update Integration Status
# ============================================================================


@router.patch("/{integration_id}/status", response_model=integration.IntegrationOut)
def update_integration_status(
    integration_id: int,
    status_update: integration.IntegrationStatusUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> models.Api:
    """Update integration status (active, expired, disabled).

    Manager (1) and Tech Admin (2) only.

    Args:
        integration_id: Integration ID to update
        status_update: New status
        current_user: Current user with company info
        db: Database session

    Returns:
        Updated integration object (IntegrationOut schema)

    Raises:
        HTTPException: 403 if user role not authorized
        HTTPException: 404 if integration not found or doesn't belong to company
    """
    # RBAC: Only Manager or Tech Admin can update
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can update integrations"
        )

    company_id = current_user["company_id"]

    # Find integration and verify ownership
    integration = db.query(models.Api).filter(
        models.Api.api_id == integration_id,
        models.Api.company_id == company_id,
    ).first()

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )

    # Update status
    try:
        integration.status = status_update.status
        db.commit()
        db.refresh(integration)
        return integration
    except Exception as e:
        db.rollback()
        print(f"Error updating integration status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update integration status"
        )


# ============================================================================
# Delete Integration
# ============================================================================


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_integration(
    integration_id: int,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> None:
    """Delete an integration.

    Manager (1) and Tech Admin (2) only. Integration must belong to company.

    Args:
        integration_id: Integration ID to delete
        current_user: Current user with company info
        db: Database session

    Raises:
        HTTPException: 403 if user role not authorized
        HTTPException: 404 if integration not found or doesn't belong to company
    """
    # RBAC: Only Manager or Tech Admin can delete
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can delete integrations"
        )

    company_id = current_user["company_id"]

    # Find integration and verify ownership
    integration = db.query(models.Api).filter(
        models.Api.api_id == integration_id,
        models.Api.company_id == company_id,
    ).first()

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )

    # Delete integration
    try:
        db.delete(integration)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error deleting integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete integration"
        )
