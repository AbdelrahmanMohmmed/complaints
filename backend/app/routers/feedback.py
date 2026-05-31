"""Feedback routes - receive and manage customer feedback from various sources."""

import logging
from datetime import datetime
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import database, models, oauth2
from ..schemas import feedback
from app.ai.predict import run_ai_pipeline

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["Feedback"])

# Simple IP-based rate limiter for public endpoints
# Track submissions: {ip_address: [(timestamp1, timestamp2, ...)]}
ip_rate_limit = defaultdict(list)
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds
MAX_REQUESTS = 5  # 5 requests per hour


def check_rate_limit(remote_address: str) -> bool:
    """Check if IP address has exceeded rate limit.

    Args:
        remote_address: Client IP address

    Returns:
        True if request allowed, False if rate limited
    """
    now = datetime.utcnow().timestamp()
    cutoff_time = now - RATE_LIMIT_WINDOW

    # Clean up old entries
    ip_rate_limit[remote_address] = [
        timestamp
        for timestamp in ip_rate_limit[remote_address]
        if timestamp > cutoff_time
    ]

    # Check if limit exceeded
    if len(ip_rate_limit[remote_address]) >= MAX_REQUESTS:
        return False

    # Record this request
    ip_rate_limit[remote_address].append(now)
    return True


def serialize_feedback(row: tuple[models.Feedback, str | None, str | None]) -> dict:
    fb, channel_name, category_name = row
    return {
        "feedback_id": fb.feedback_id,
        "company_id": fb.company_id,
        "api_id": fb.api_id,
        "channel_name": channel_name,
        "category_id": fb.category_id,
        "category_name": category_name,
        "customer_name": fb.customer_name,
        "feedback_context": fb.feedback_context,
        "status": fb.status,
        "sentiment": fb.sentiment,
        "sentiment_id": fb.sentiment_id,
        "emotion": fb.emotion,
        "emotion_id": fb.emotion_id,
        "problem_type": fb.problem_type,
        "problem_type_id": fb.problem_type_id,
        "priority": fb.priority,
        "created_at": fb.created_at,
    }


class FeedbackClassificationUpdate(BaseModel):
    problem_type: str | None = None
    problem_type_id: int | None = None
    sentiment: str | None = None
    sentiment_id: int | None = None
    emotion: str | None = None
    emotion_id: int | None = None


# ============================================================================
# Web Form Display
# ============================================================================


@router.get("/form/{token}", response_class=HTMLResponse)
def get_form(
    token: str,
    db: Session = Depends(database.get_db),
) -> str:
    """Display the web form for receiving feedback.

    Public endpoint. Returns HTML form page branded with company name.
    Token must correspond to an active webform integration.

    Args:
        token: Unique form token from integrations table
        db: Database session

    Returns:
        HTML page with complaint form

    Raises:
        HTTPException: 404 if token not found or integration not active
    """
    # Look up integration by api_key = token
    integration = (
        db.query(models.Api)
        .filter(
            models.Api.api_key == token,
            models.Api.channel_name == "webform",
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )

    # Check if integration is active
    if integration.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )

    # Get company name
    company = (
        db.query(models.Company)
        .filter(models.Company.company_id == integration.company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )

    company_name = company.company_name

    # HTML form template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submit Feedback</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }}
    .card {{
      background: white;
      border-radius: 12px;
    router = APIRouter(prefix="/feedback", tags=["Feedback"])
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }}
    .company-name {{
      font-size: 22px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 6px;
    }}
    .subtitle {{
      font-size: 14px;
      color: #888;
      margin-bottom: 28px;
    }}
    label {{
      font-size: 14px;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8px;
    }}
    textarea {{
      width: 100%;
      height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      outline: none;
    }}
    textarea:focus {{ border-color: #4A90E2; }}
    .char-count {{
      font-size: 12px;
      color: #aaa;
      text-align: right;
      margin-top: 4px;
      margin-bottom: 20px;
    }}
    .char-count.error {{ color: #e24b4a; }}
    button {{
      width: 100%;
      padding: 14px;
      background: #4A90E2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }}
    button:hover {{ background: #357ABD; }}
    button:disabled {{ background: #aaa; cursor: not-allowed; }}
    .success-box {{
      display: none;
      text-align: center;
      padding: 30px 0;
    }}
    .success-box .checkmark {{ font-size: 48px; margin-bottom: 16px; }}
    .success-box h2 {{ font-size: 20px; color: #1a1a1a; margin-bottom: 8px; }}
    .success-box p {{ font-size: 14px; color: #888; }}
    .error-msg {{
      display: none;
      color: #e24b4a;
      font-size: 13px;
      margin-top: 10px;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div id="form-section">
      <div class="company-name">{company_name}</div>
      <div class="subtitle">We value your feedback</div>
            <label>Customer name (optional)</label>
            <input
                id="customer-name"
                placeholder="Your name"
                maxlength="100"
                style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:16px;"
            />
            <label>Share your complaint or feedback</label>
      <textarea
        id="complaint"
        placeholder="Type your complaint here... (supports Arabic, English, and Franco)"
        maxlength="1000"
        oninput="updateCount()"
      ></textarea>
      <div class="char-count" id="char-count">0 / 1000</div>
      <button id="submit-btn" onclick="submitForm()" disabled>Submit Feedback</button>
      <div class="error-msg" id="error-msg">Something went wrong. Please try again.</div>
    </div>
    <div class="success-box" id="success-section">
      <div class="checkmark">✅</div>
      <h2>Thank you for your feedback!</h2>
      <p>Your complaint has been received and will be reviewed shortly.</p>
    </div>
  </div>
  <script>
    const MIN = 10;
    const MAX = 1000;
    const token = "{token}";

    function updateCount() {{
      const text = document.getElementById("complaint").value;
      const count = text.length;
      const counter = document.getElementById("char-count");
      const btn = document.getElementById("submit-btn");
      counter.textContent = count + " / " + MAX;
      if (count < MIN || count > MAX) {{
        counter.classList.add("error");
        btn.disabled = true;
      }} else {{
        counter.classList.remove("error");
        btn.disabled = false;
      }}
    }}

    async function submitForm() {{
    const text = document.getElementById("complaint").value.trim();
    const customerName = document.getElementById("customer-name").value.trim();
      const btn = document.getElementById("submit-btn");
      const errorMsg = document.getElementById("error-msg");
      btn.disabled = true;
      btn.textContent = "Submitting...";
      errorMsg.style.display = "none";
      try {{
        const response = await fetch(`/api/v1/feedback/form/${{token}}`, {{
          method: "POST",
          headers: {{ "Content-Type": "application/json" }},
                    body: JSON.stringify({{ feedback_context: text, customer_name: customerName || null }})
        }});
        if (response.ok) {{
          document.getElementById("form-section").style.display = "none";
          document.getElementById("success-section").style.display = "block";
        }} else {{
          throw new Error("Failed");
        }}
      }} catch {{
        btn.disabled = false;
        btn.textContent = "Submit Feedback";
        errorMsg.style.display = "block";
      }}
    }}
  </script>
</body>
</html>"""

    return html_content


# ============================================================================
# Web Form Submission
# ============================================================================


@router.post("/form/{token}", response_model=feedback.WebFormResponse)
async def submit_form(
    token: str,
    submission: feedback.WebFormSubmission,
    request: Request,
    db: Session = Depends(database.get_db),
) -> dict:
    """Handle web form feedback submission.

    Public endpoint with rate limiting (5 per IP per hour).
    Validates feedback and saves to database instantly.

    Args:
        token: Unique form token from integrations table
        submission: Feedback submission with feedback_context
        request: HTTP request (for IP address rate limiting)
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: 404 if token not found or integration not active
        HTTPException: 400 if feedback validation fails
        HTTPException: 429 if rate limit exceeded
    """
    # Get client IP address
    client_ip = request.client.host if request.client else "unknown"

    # Check rate limit
    if not check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many submissions. Please try again later.",
        )

    # Look up integration by api_key = token
    integration = (
        db.query(models.Api)
        .filter(
            models.Api.api_key == token,
            models.Api.channel_name == "webform",
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )

    # Check if integration is active
    if integration.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )

    # Get feedback_context from submission
    feedback_context = (
        submission.feedback_context.strip() if submission.feedback_context else ""
    )

    # Validate feedback_context
    if not feedback_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Complaint text is required"
        )

    if len(feedback_context) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint must be at least 10 characters",
        )

    if len(feedback_context) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint must not exceed 1000 characters",
        )

    # Save feedback to database instantly
    try:
        new_feedback = models.Feedback(
            company_id=integration.company_id,
            api_id=integration.api_id,
            feedback_context=feedback_context,
            status="unprocessed",
            created_at=datetime.utcnow(),
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)

        # Run AI pipeline synchronously for immediate feedback to frontend
        try:
            ai_result = run_ai_pipeline(feedback_context)
            # Update feedback record with AI results
            new_feedback.sentiment = ai_result.get("sentiment")
            new_feedback.sentiment_id = ai_result.get("sentiment_id")
            new_feedback.emotion = ai_result.get("emotion")
            new_feedback.emotion_id = ai_result.get("emotion_id")
            new_feedback.problem_type = ai_result.get("problem_type")
            new_feedback.problem_type_id = ai_result.get("problem_type_id")
            new_feedback.priority = ai_result.get("priority")
            new_feedback.status = "processed"
            db.commit()
            db.refresh(new_feedback)
        except Exception as e:
            logger.exception(
                "AI pipeline failed for feedback_id=%s: %s",
                new_feedback.feedback_id,
                str(e),
            )

        logger.info(
            f"Web form feedback received from company_id={integration.company_id}, "
            f"feedback_id={new_feedback.feedback_id}"
        )

        return {
            "message": "Thank you for your feedback! Your complaint has been received and will be reviewed shortly."
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error saving web form feedback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save feedback",
        )


# ==========================================================================
# Authenticated Feedback Endpoints
# ==========================================================================


@router.get("/", response_model=list[feedback.FeedbackOut])
def list_feedback(
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> list[dict]:
    """List all feedback for the authenticated company."""
    rows = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.company_id == current_user["company_id"])
        .order_by(models.Feedback.created_at.desc())
        .all()
    )

    return [serialize_feedback(row) for row in rows]


@router.get("/{feedback_id}", response_model=feedback.FeedbackOut)
def get_feedback(
    feedback_id: int,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    """Get a single feedback item for the authenticated company."""
    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    return serialize_feedback(row)


@router.patch("/{feedback_id}/status", response_model=feedback.FeedbackOut)
def update_feedback_status(
    feedback_id: int,
    payload: feedback.FeedbackStatusUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    """Update feedback status."""
    fb = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    fb.status = payload.status
    db.commit()
    db.refresh(fb)

    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.feedback_id == feedback_id)
        .first()
    )

    return serialize_feedback(row) if row else serialize_feedback((fb, None, None))


@router.patch("/{feedback_id}/details", response_model=feedback.FeedbackOut)
def update_feedback_details(
    feedback_id: int,
    payload: feedback.FeedbackDetailsUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    """Update feedback priority and category."""
    fb = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    if payload.priority is not None:
        fb.priority = payload.priority
    fb.category_id = payload.category_id

    db.commit()
    db.refresh(fb)

    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.feedback_id == feedback_id)
        .first()
    )

    return serialize_feedback(row) if row else serialize_feedback((fb, None, None))


@router.patch("/{feedback_id}/problem-type", response_model=feedback.FeedbackOut)
def update_feedback_problem_type(
    feedback_id: int,
    payload: FeedbackClassificationUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    fb = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    fb.problem_type = payload.problem_type
    fb.problem_type_id = payload.problem_type_id
    db.commit()
    db.refresh(fb)

    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.feedback_id == feedback_id)
        .first()
    )

    return serialize_feedback(row) if row else serialize_feedback((fb, None, None))


@router.patch("/{feedback_id}/sentiment", response_model=feedback.FeedbackOut)
def update_feedback_sentiment(
    feedback_id: int,
    payload: FeedbackClassificationUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    fb = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    fb.sentiment = payload.sentiment
    fb.sentiment_id = payload.sentiment_id
    db.commit()
    db.refresh(fb)

    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.feedback_id == feedback_id)
        .first()
    )

    return serialize_feedback(row) if row else serialize_feedback((fb, None, None))


@router.patch("/{feedback_id}/emotion", response_model=feedback.FeedbackOut)
def update_feedback_emotion(
    feedback_id: int,
    payload: FeedbackClassificationUpdate,
    current_user: dict = Depends(oauth2.get_current_user_with_company),
    db: Session = Depends(database.get_db),
) -> dict:
    fb = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user["company_id"],
        )
        .first()
    )

    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    fb.emotion = payload.emotion
    fb.emotion_id = payload.emotion_id
    db.commit()
    db.refresh(fb)

    row = (
        db.query(
            models.Feedback,
            models.Api.channel_name,
            models.FeedbackCategory.category_name,
        )
        .outerjoin(models.Api, models.Feedback.api_id == models.Api.api_id)
        .outerjoin(
            models.FeedbackCategory,
            models.Feedback.category_id == models.FeedbackCategory.category_id,
        )
        .filter(models.Feedback.feedback_id == feedback_id)
        .first()
    )

    return serialize_feedback(row) if row else serialize_feedback((fb, None, None))
