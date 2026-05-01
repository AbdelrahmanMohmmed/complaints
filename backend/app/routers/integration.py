"""API integration management routes - create, list, update, delete integrations.

Handles connections to external feedback sources (Facebook and Freshdesk).
Includes credential validation, encryption, and role-based access control.
"""

import httpx
import logging
import hashlib
import hmac
import secrets
from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import database, models, oauth2, utils
from ..schemas import integration, feedback
from ..config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["Integrations"])


# ============================================================================
# Configuration & Authorization
# ============================================================================

# Platform API endpoints
BASE_URLS = {
    "facebook": "https://graph.facebook.com",
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
        channel_name: Platform name (facebook)
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


# ============================================================================
# Web Form Integration
# ============================================================================


@router.post(
    "/webform", status_code=status.HTTP_201_CREATED, response_model=feedback.WebFormIntegrationResponse
)
def create_webform_integration(
    request: Request,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    """Create a web form integration for the company.

    Generates a unique token for the web form. Company can only have one active webform.
    Manager (1) and Tech Admin (2) only.

    Args:
        request: HTTP request (to get base URL)
        current_user: Current user with company info
        db: Database session

    Returns:
        Dictionary with form_url, channel_name, and status

    Raises:
        HTTPException: 403 if user role not authorized
        HTTPException: 409 if company already has webform integration
    """
    # RBAC: Only Manager (1) and Tech Admin (2) can create
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can create integrations"
        )

    company_id = current_user["company_id"]

    # Check if company already has a webform integration
    existing = db.query(models.Api).filter(
        models.Api.company_id == company_id,
        models.Api.channel_name == "webform",
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Web form already exists for this company"
        )

    # Generate unique token
    token = secrets.token_urlsafe(32)

    # Create the form URL using actual server base URL
    base_url = str(request.base_url).rstrip('/')
    form_url = f"{base_url}/api/v1/feedback/form/{token}"

    # Create integration record
    try:
        new_integration = models.Api(
            company_id=company_id,
            channel_name="webform",
            api_key=token,  # Plain text, no encryption needed for webform
            api_base_url=form_url,
            status="active",
        )
        db.add(new_integration)
        db.commit()
        db.refresh(new_integration)

        return {
            "form_url": form_url,
            "channel_name": "webform",
            "status": "active"
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create webform integration"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating webform integration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error creating webform integration"
        )


# ============================================================================
# Facebook OAuth Flow
# ============================================================================


@router.get("/facebook/connect")
def facebook_connect(
    current_user: dict = Depends(oauth2.get_current_user_with_company),
) -> dict:
    """Generate Facebook OAuth authorization URL.
    
    Called when the client clicks "Connect Facebook Page" button.
    Returns the URL to redirect the client to for Facebook login and page selection.
    
    Uses state parameter to securely pass company_id through the OAuth flow.
    
    Args:
        current_user: Current authenticated user with company info
        
    Returns:
        Dictionary with oauth_url to redirect to
        
    Raises:
        HTTPException: 401 if user not authenticated
    """
    company_id = current_user["company_id"]
    
    # Create state parameter with company_id (for CSRF protection and passing context)
    # Format: company_id|signature
    state_data = f"{company_id}"
    signature = hmac.new(
        settings.secret_key.encode(),
        state_data.encode(),
        hashlib.sha256
    ).hexdigest()
    state = f"{state_data}|{signature}"
    
    facebook_oauth_url = (
        f"https://www.facebook.com/dialog/oauth"
        f"?client_id={settings.FACEBOOK_APP_ID}"
        f"&redirect_uri={settings.FACEBOOK_REDIRECT_URI}"
        f"&scope=pages_read_engagement,pages_show_list,pages_read_user_content"
        f"&response_type=code"
        f"&state={state}"
    )
    
    logger.info(f"Generated Facebook OAuth URL for user {current_user['user_id']}, company {company_id}")
    
    return {"oauth_url": facebook_oauth_url}


@router.get("/facebook/callback")
async def facebook_callback(
    code: str = Query(..., description="Authorization code from Facebook"),
    state: str = Query(..., description="State parameter with company_id"),
    db: Session = Depends(database.get_db),
):
    """Handle Facebook OAuth callback.
    
    Receives the authorization code from Facebook after client approval.
    Exchanges code for tokens and saves permanent page access tokens to database.
    
    Does NOT require JWT - uses state parameter to get company_id.
    
    Flow:
    1. Validate state parameter (CSRF protection)
    2. Exchange code for short-lived user access token
    3. Exchange short-lived token for long-lived token (60 days)
    4. Get pages list with permanent page access tokens
    5. Save each page as separate integration record
    6. Redirect to frontend dashboard
    
    Args:
        code: Authorization code from Facebook
        state: State parameter containing company_id and signature
        db: Database session
        
    Returns:
        RedirectResponse to frontend dashboard
        
    Raises:
        HTTPException: 400 if state validation fails
        HTTPException: 400 if Facebook authorization fails
        HTTPException: 400 if no pages found
        HTTPException: 409 if page already connected
        HTTPException: 504 if timeout
    """
    try:
        # ===== Step 0: Validate state parameter =====
        if not state or "|" not in state:
            logger.warning("Invalid state parameter received")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state parameter"
            )
        
        state_data, state_signature = state.split("|", 1)
        
        # Verify signature
        expected_signature = hmac.new(
            settings.secret_key.encode(),
            state_data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(state_signature, expected_signature):
            logger.warning("State signature validation failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="State validation failed - CSRF protection"
            )
        
        company_id = int(state_data)
        logger.info(f"State validated for company {company_id}")
        
        # ===== Step 1: Exchange code for short-lived user access token =====
        logger.info(f"Starting Facebook OAuth flow for company {company_id}")
        
        token_url = "https://graph.facebook.com/oauth/access_token"
        token_params = {
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "code": code,
        }
        
        async with httpx.AsyncClient(timeout=10) as client:
            token_response = await client.get(token_url, params=token_params)
        
        if token_response.status_code != 200:
            error_data = token_response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            logger.warning(f"Facebook token exchange failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Facebook authorization failed: {error_msg}"
            )
        
        token_data = token_response.json()
        short_lived_token = token_data.get("access_token")
        
        if not short_lived_token:
            logger.warning("No access token in Facebook response")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Facebook authorization failed: No access token received"
            )
        
        logger.info(f"Obtained short-lived token for company {company_id}")
        
        # ===== Step 2: Exchange short-lived token for long-lived token =====
        exchange_url = "https://graph.facebook.com/oauth/access_token"
        exchange_params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "fb_exchange_token": short_lived_token,
        }
        
        async with httpx.AsyncClient(timeout=10) as client:
            exchange_response = await client.get(exchange_url, params=exchange_params)
        
        if exchange_response.status_code != 200:
            error_data = exchange_response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            logger.warning(f"Facebook token exchange failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Facebook authorization failed: {error_msg}"
            )
        
        exchange_data = exchange_response.json()
        long_lived_token = exchange_data.get("access_token")
        
        if not long_lived_token:
            logger.warning("No long-lived token in Facebook response")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Facebook authorization failed: No long-lived token received"
            )
        
        logger.info(f"Obtained long-lived token for company {company_id}")
        
        # ===== Step 3: Get list of pages with permanent page access tokens =====
        pages_url = "https://graph.facebook.com/me/accounts"
        pages_params = {
            "access_token": long_lived_token,
        }
        
        async with httpx.AsyncClient(timeout=10) as client:
            pages_response = await client.get(pages_url, params=pages_params)
        
        if pages_response.status_code != 200:
            error_data = pages_response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            logger.warning(f"Failed to fetch Facebook pages: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Facebook authorization failed: {error_msg}"
            )
        
        pages_data = pages_response.json()
        pages = pages_data.get("data", [])
        
        if not pages:
            logger.warning(f"No Facebook pages found for company {company_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Facebook pages found. Please make sure you have a Facebook Business Page"
            )
        
        logger.info(f"Found {len(pages)} Facebook page(s) for company {company_id}")
        
        # ===== Step 4: Save each page as integration record =====
        saved_count = 0
        skipped_count = 0
        
        for page in pages:
            page_id = page.get("id")
            page_name = page.get("name", "Unknown")
            permanent_token = page.get("access_token")
            
            if not page_id or not permanent_token:
                logger.warning(f"Missing page_id or token for page {page_name}")
                skipped_count += 1
                continue
            
            try:
                # Check if this page is already connected
                existing = db.query(models.Api).filter(
                    models.Api.company_id == company_id,
                    models.Api.channel_name == "facebook",
                    models.Api.platform_page_id == page_id,
                ).first()
                
                if existing:
                    logger.info(f"Page {page_name} ({page_id}) already connected for company {company_id}")
                    skipped_count += 1
                    continue
                
                # Encrypt the permanent token before saving
                encrypted_token = utils.encrypt_api_key(permanent_token)
                
                # Create integration record
                new_integration = models.Api(
                    company_id=company_id,
                    channel_name="facebook",
                    api_key=encrypted_token,
                    platform_page_id=page_id,
                    api_base_url=BASE_URLS["facebook"],
                    status="active",
                )
                
                db.add(new_integration)
                db.commit()
                db.refresh(new_integration)
                
                logger.info(f"Saved Facebook page {page_name} ({page_id}) for company {company_id}")
                saved_count += 1
                
            except IntegrityError:
                db.rollback()
                logger.error(f"Integrity error saving page {page_name} ({page_id}) for company {company_id}")
                skipped_count += 1
            except Exception as e:
                db.rollback()
                logger.error(f"Error saving page {page_name} ({page_id}): {str(e)}")
                skipped_count += 1
        
        logger.info(f"Facebook OAuth completed for company {company_id}: {saved_count} saved, {skipped_count} skipped")
        
        # ===== Step 5: Redirect back to dashboard =====
        return RedirectResponse(
            url=f"https://yourapp.com/dashboard?integration=success&pages={saved_count}",
            status_code=status.HTTP_302_FOUND
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except httpx.TimeoutException:
        logger.error(f"Facebook API timeout")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Facebook API timeout, please try again"
        )
    except Exception as e:
        logger.error(f"Unexpected error in Facebook callback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error during Facebook authorization"
        )

# ============================================================================
# Freshdesk Integration
# ============================================================================


@router.post(
    "/freshdesk", status_code=status.HTTP_201_CREATED, response_model=integration.IntegrationOut
)
async def create_freshdesk_integration(
    freshdesk_data: integration.FreshdeskCreate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> models.Api:
    """Create a new Freshdesk integration.

    Validates Freshdesk credentials by making a test API call.
    Encrypts API key and saves to database.

    Args:
        freshdesk_data: Freshdesk domain and API key
        current_user: Current user with company info
        db: Database session

    Returns:
        Created integration object (IntegrationOut schema)

    Raises:
        HTTPException: 403 if user role not authorized
        HTTPException: 400 if domain or credentials invalid
        HTTPException: 409 if Freshdesk already connected
    """
    # RBAC: Only Manager (1) and Tech Admin (2) can create
    if current_user["role_id"] not in ALLOWED_ROLES_MANAGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager or Tech Admin can create integrations"
        )

    company_id = current_user["company_id"]
    domain = freshdesk_data.domain.strip()
    api_key = freshdesk_data.api_key.strip()

    # Validate domain format (basic check)
    if not domain or not domain.endswith("freshdesk.com"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Freshdesk domain. Must end with 'freshdesk.com' (e.g. fmstest.freshdesk.com)"
        )

    # Check for duplicate Freshdesk integration
    existing = db.query(models.Api).filter(
        models.Api.company_id == company_id,
        models.Api.channel_name == "freshdesk",
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Freshdesk is already connected"
        )

    # Validate credentials with Freshdesk API
    api_base_url = f"https://{domain}"
    is_valid = await validate_freshdesk_credentials(api_key, api_base_url)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Freshdesk credentials"
        )

    # Encrypt API key before storage
    encrypted_key = utils.encrypt_api_key(api_key)

    # Create integration record
    try:
        new_integration = models.Api(
            company_id=company_id,
            channel_name="freshdesk",
            api_key=encrypted_key,
            api_base_url=api_base_url,
            status="active",
        )
        db.add(new_integration)
        db.commit()
        db.refresh(new_integration)
        
        logger.info(f"Created Freshdesk integration {new_integration.api_id} for company {company_id}")
        return new_integration

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create Freshdesk integration"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating Freshdesk integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error creating Freshdesk integration"
        )


async def validate_freshdesk_credentials(api_key: str, api_base_url: str) -> bool:
    """Validate Freshdesk API credentials.

    Makes a test API call to Freshdesk to verify the API key is valid.

    Args:
        api_key: Freshdesk API key
        api_base_url: Freshdesk base URL (e.g. https://fmstest.freshdesk.com)

    Returns:
        True if credentials are valid, False otherwise
    """
    import base64
    
    try:
        # Create Basic Auth header
        credentials = base64.b64encode(f"{api_key}:X".encode()).decode()
        headers = {"Authorization": f"Basic {credentials}"}
        
        # Make test API call
        url = f"{api_base_url}/api/v2/tickets"
        params = {"per_page": 1}
        
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers, params=params)
            return response.status_code == 200

    except httpx.RequestError:
        logger.warning("Freshdesk API request failed")
        return False
    except Exception as e:
        logger.error(f"Error validating Freshdesk credentials: {str(e)}")
        return False
