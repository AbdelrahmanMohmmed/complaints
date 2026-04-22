import httpx
import imaplib
import json
from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from .. import models, utils, database, oauth2
from ..schemas import integration

router = APIRouter(prefix="/integrations", tags=["Integrations"])

# Platform base URLs
BASE_URLS = {
    "facebook": "https://graph.facebook.com",
    "twitter": "https://api.twitter.com/2",
    "whatsapp": "https://graph.facebook.com/v17.0",
    "gmail": "imap.gmail.com",
}

# RBAC: Manager (1) and Tech Admin (2) have all permissions
# CSS (3) has no access
ALLOWED_ROLES_MANAGE = [1, 2]  # Manager and Tech Admin can create/update/delete
ALLOWED_ROLES_VIEW = [1, 2]  # Manager and Tech Admin can view


def validate_gmail_credentials(
    username: str, password: str
) -> tuple[bool, str, str, str]:
    """
    Validate Gmail credentials via IMAP login.

    Returns (is_valid, detail, normalized_username, normalized_password).
    """
    normalized_username = (username or "").strip().lower()
    normalized_password = "".join((password or "").split())

    if "@" not in normalized_username:
        normalized_username = f"{normalized_username}@gmail.com"

    if not normalized_username or not normalized_password:
        return (
            False,
            "Gmail username and app password are required",
            normalized_username,
            normalized_password,
        )

    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        try:
            mail.login(normalized_username, normalized_password)
            mail.logout()
            return True, "", normalized_username, normalized_password
        except imaplib.IMAP4.error:
            return (
                False,
                "Invalid Gmail credentials. Use full Gmail address and 16-character App Password (without spaces).",
                normalized_username,
                normalized_password,
            )
    except Exception:
        return (
            False,
            "Could not connect to Gmail IMAP server. Try again and ensure network access to imap.gmail.com:993.",
            normalized_username,
            normalized_password,
        )


async def validate_api_credentials(
    channel_name: str,
    api_key: str | None = None,
    gmail_username: str | None = None,
    gmail_password: str | None = None,
) -> tuple[bool, str, str | None, str | None]:
    """Validate API credentials against the real platform API"""
    try:
        if channel_name == "facebook":
            # Facebook: GET /me with access_token param
            url = f"{BASE_URLS['facebook']}/me"
            params = {"access_token": api_key}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
                return response.status_code == 200, "", None, None

        elif channel_name == "twitter":
            # Use /2/tweets/search/recent instead — works with app-only Bearer token
            url = f"{BASE_URLS['twitter']}/tweets/search/recent"
            headers = {"Authorization": f"Bearer {api_key}"}
            params = {"query": "test", "max_results": 10}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers, params=params)
                return response.status_code == 200, "", None, None

        elif channel_name == "whatsapp":
            # WhatsApp: GET /me with Bearer token
            url = f"{BASE_URLS['whatsapp']}/me"
            headers = {"Authorization": f"Bearer {api_key}"}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers)
                return response.status_code == 200, "", None, None

        elif channel_name == "gmail":
            if not gmail_username or not gmail_password:
                return (
                    False,
                    "gmail_username and gmail_password are required",
                    None,
                    None,
                )
            return validate_gmail_credentials(gmail_username, gmail_password)

        return False, "Unsupported channel", None, None

    except httpx.RequestError:
        # Connection error - credential validation failed
        return False, "Could not reach provider API", None, None
    except Exception as e:
        print(f"Error validating credentials: {e}")
        return False, "Unexpected error validating credentials", None, None


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=integration.IntegrationOut
)
async def create_integration(
    integration_data: integration.IntegrationCreate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
):
    """
    Create a new API integration for the company.

    - Only Manager (role_id=1) and Tech Admin (role_id=2) can create integrations
    - Validates credentials against the real platform API before saving
    - Encrypts api_key before storing in database
    - Returns 400 if credentials are invalid
    - Returns 403 if user role is not allowed
    - Returns 409 if the same channel_name is already configured
    """

    # RBAC Check: Only Manager (1) and Tech Admin (2) can create integrations
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can create integrations",
        )

    company_id = current_user["company_id"]
    channel_name = integration_data.channel_name
    api_key = integration_data.api_key
    gmail_username = integration_data.gmail_username
    gmail_password = integration_data.gmail_password

    # Check if channel_name is valid
    if channel_name not in BASE_URLS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid channel_name. Must be one of: {', '.join(BASE_URLS.keys())}",
        )

    # Check if this company already has this integration
    existing = (
        db.query(models.Api)
        .filter(
            models.Api.company_id == company_id, models.Api.channel_name == channel_name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Integration for {channel_name} already configured for this company",
        )

    if channel_name == "gmail":
        if not gmail_username or not gmail_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="gmail_username and gmail_password are required for Gmail integration",
            )
    else:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="api_key is required for this integration",
            )

    # Validate credentials against the real platform API
    (
        is_valid,
        validation_detail,
        normalized_gmail_username,
        normalized_gmail_password,
    ) = await validate_api_credentials(
        channel_name,
        api_key=api_key,
        gmail_username=gmail_username,
        gmail_password=gmail_password,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_detail or f"Invalid {channel_name} credentials",
        )

    # Encrypt credential payload before saving
    if channel_name == "gmail":
        secret_payload = json.dumps(
            {
                "username": normalized_gmail_username or gmail_username,
                "password": normalized_gmail_password or gmail_password,
            }
        )
    else:
        secret_payload = api_key

    encrypted_key = utils.encrypt_api_key(secret_payload)

    # Create the integration record
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

    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if e.orig else str(e)
        print(f"❌ IntegrityError creating integration: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create integration",
        )
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error creating integration",
        )


@router.get("/", response_model=List[integration.IntegrationOut])
def list_integrations(
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
):
    """
    List all integrations for the authenticated company.

    - Manager (1) and Tech Admin (2) can view integrations
    - Never returns raw api_key
    """

    # RBAC Check: Allow Manager and Tech Admin to view
    if current_user["role_id"] not in ALLOWED_ROLES_VIEW:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view integrations",
        )

    company_id = current_user["company_id"]

    integrations = (
        db.query(models.Api).filter(models.Api.company_id == company_id).all()
    )

    return integrations


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_integration(
    integration_id: int,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
):
    """
    Delete an integration.

    - Only Manager (1) or Tech Admin (2) can delete
    - Integration must belong to the authenticated company
    """

    # RBAC Check: Only Manager or Tech Admin can delete
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can delete integrations",
        )

    company_id = current_user["company_id"]

    # Find and verify ownership
    integration = (
        db.query(models.Api)
        .filter(
            models.Api.api_id == integration_id, models.Api.company_id == company_id
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found"
        )

    try:
        db.delete(integration)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete integration",
        )


@router.patch("/{integration_id}/status", response_model=integration.IntegrationOut)
def update_integration_status(
    integration_id: int,
    status_update: integration.IntegrationStatusUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
):
    """
    Update integration status (active or expired).

    - Only Manager (1) or Tech Admin (2) can update
    - Integration must belong to the authenticated company
    """

    # RBAC Check: Only Manager or Tech Admin can update
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can update integrations",
        )

    company_id = current_user["company_id"]

    # Find and verify ownership
    integration = (
        db.query(models.Api)
        .filter(
            models.Api.api_id == integration_id, models.Api.company_id == company_id
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found"
        )

    try:
        integration.status = status_update.status
        db.commit()
        db.refresh(integration)
        return integration
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating integration status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update integration status",
        )
