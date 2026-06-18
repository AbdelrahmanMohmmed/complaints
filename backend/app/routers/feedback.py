"""Feedback routes - receive and manage customer feedback from various sources."""

import logging
from datetime import datetime
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import database, models, oauth2
from ..schemas import feedback
from app.ai.arabic_predictor import load_arabic_models, predict_arabic
from app.ai.english_predictor import load_english_models, predict_english
from app.preprocessing.router import detect_language, preprocess_feedback

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


def _process_webform_feedback_async(feedback_id: int) -> None:
    """Process webform feedback in background after HTTP response."""
    db = database.SessionLocal()
    try:
        feedback_row = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
        if not feedback_row:
            logger.warning("Background feedback job: feedback_id=%s not found", feedback_id)
            return

        feedback_text = feedback_row.feedback_context or ""

        try:
            feedback_row.language = detect_language(feedback_text)
            feedback_row.cleaned_text = preprocess_feedback(feedback_text)
            feedback_row.status = "preprocessed"
            db.commit()
            db.refresh(feedback_row)
            logger.info("Background preprocessing complete for feedback_id=%s", feedback_id)
        except Exception as e:
            logger.error(
                "Background preprocessing failed for feedback_id=%s: %s",
                feedback_id,
                str(e),
                exc_info=True,
            )
            db.rollback()
            return

        try:
            language = feedback_row.language or detect_language(feedback_row.cleaned_text or feedback_text)
            cleaned_text = feedback_row.cleaned_text or feedback_text
            if language in ("ar", "franko"):
                ai_models = load_arabic_models()
                ai_result = predict_arabic(cleaned_text, ai_models)
            else:
                ai_models = load_english_models()
                ai_result = predict_english(cleaned_text, ai_models)

            feedback_row.sentiment = ai_result.get("sentiment")
            feedback_row.sentiment_id = ai_result.get("sentiment_id")
            feedback_row.emotion = ai_result.get("emotion")
            feedback_row.emotion_id = ai_result.get("emotion_id")
            feedback_row.problem_type = ai_result.get("problem_type")
            feedback_row.problem_type_id = ai_result.get("problem_type_id")
            priority = ai_result.get("priority")
            feedback_row.priority = priority.lower() if isinstance(priority, str) else priority
            feedback_row.status = "analyzed"
            db.commit()
            db.refresh(feedback_row)
            logger.info("Background AI analysis complete for feedback_id=%s", feedback_id)
        except Exception as e:
            logger.error(
                "Background AI pipeline failed for feedback_id=%s: %s",
                feedback_id,
                str(e),
                exc_info=True,
            )
            db.rollback()
    finally:
        db.close()


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
        "language": fb.language,
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
    :root {{
      --bg: #020617;
      --panel: rgba(15, 23, 42, 0.84);
      --panel-border: rgba(148, 163, 184, 0.18);
      --text: #e5e7eb;
      --muted: #94a3b8;
      --field: rgba(2, 6, 23, 0.72);
      --field-border: rgba(148, 163, 184, 0.18);
      --accent: #f97316;
      --accent-blue: #2563eb;
      --shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
    }}
    body {{
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 30%),
        radial-gradient(circle at top right, rgba(249, 115, 22, 0.16), transparent 26%),
        linear-gradient(135deg, #020617 0%, #0f172a 52%, #111827 100%);
      color: var(--text);
      overflow: hidden;
    }}
    body::before,
    body::after {{
      content: "";
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      filter: blur(40px);
      opacity: 0.55;
    }}
    body::before {{
      width: 280px;
      height: 280px;
      top: -90px;
      left: -70px;
      background: rgba(37, 99, 235, 0.18);
    }}
    body::after {{
      width: 240px;
      height: 240px;
      right: -80px;
      bottom: -70px;
      background: rgba(249, 115, 22, 0.14);
    }}
    .card {{
      width: min(100%, 640px);
      padding: 36px;
      border-radius: 28px;
      background: var(--panel);
      border: 1px solid var(--panel-border);
      box-shadow: var(--shadow);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      position: relative;
      z-index: 1;
    }}
    .pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 9999px;
      border: 1px solid rgba(37, 99, 235, 0.35);
      background: rgba(37, 99, 235, 0.14);
      color: #bfdbfe;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }}
    .company-name {{
      font-size: 30px;
      line-height: 1.15;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 10px;
    }}
    .subtitle {{
      font-size: 14px;
      color: var(--muted);
      margin-bottom: 28px;
      max-width: 52ch;
    }}
    .field-group {{
      margin-bottom: 18px;
    }}
    label {{
      font-size: 13px;
      font-weight: 700;
      color: #cbd5e1;
      display: block;
      margin-bottom: 8px;
    }}
    input,
    textarea {{
      width: 100%;
      border: 1px solid var(--field-border);
      border-radius: 16px;
      background: var(--field);
      color: var(--text);
      outline: none;
      transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }}
    input {{
      padding: 13px 14px;
      font-size: 14px;
    }}
    textarea {{
      min-height: 170px;
      padding: 14px;
      font-size: 14px;
      resize: vertical;
    }}
    input::placeholder,
    textarea::placeholder {{
      color: #64748b;
    }}
    input:focus,
    textarea:focus {{
      border-color: rgba(249, 115, 22, 0.65);
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
    }}
    .char-count {{
      font-size: 12px;
      color: var(--muted);
      text-align: right;
      margin-top: 6px;
      margin-bottom: 20px;
    }}
    .char-count.error {{ color: #fca5a5; }}
    button {{
      width: 100%;
      padding: 14px 16px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent));
      color: white;
      border: none;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      box-shadow: 0 14px 30px rgba(37, 99, 235, 0.25);
    }}
    button:hover {{ transform: translateY(-1px); }}
    button:disabled {{
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }}
    .success-box {{
      display: none;
      text-align: center;
      padding: 30px 0 10px;
    }}
    .success-box .checkmark {{
      width: 72px;
      height: 72px;
      border-radius: 20px;
      margin: 0 auto 18px;
      display: grid;
      place-items: center;
      font-size: 34px;
      background: rgba(34, 197, 94, 0.16);
      color: #86efac;
      border: 1px solid rgba(34, 197, 94, 0.24);
    }}
    .success-box h2 {{
      font-size: 22px;
      color: #ffffff;
      margin-bottom: 8px;
    }}
    .success-box p {{
      font-size: 14px;
      color: var(--muted);
    }}
    .error-msg {{
      display: none;
      color: #fca5a5;
      font-size: 13px;
      margin-top: 10px;
      text-align: center;
    }}
    @media (max-width: 640px) {{
      body {{ padding: 14px; }}
      .card {{ padding: 24px; border-radius: 24px; }}
      .company-name {{ font-size: 24px; }}
    }}
  </style>
</head>
<body>
  <div class="card">
    <div id="form-section">
      <div class="pill">Customer feedback</div>
      <div class="company-name">{company_name}</div>
      <div class="subtitle">Send complaint, suggestion, or praise. We read every submission.</div>
      <div class="field-group">
        <label>Customer name (optional)</label>
        <input
          id="customer-name"
          placeholder="Your name"
          maxlength="100"
        />
      </div>
      <div class="field-group">
        <label>Share your complaint or feedback</label>
        <textarea
          id="complaint"
          placeholder="Type your complaint here... (supports Arabic, English, and Franco)"
          maxlength="1000"
          oninput="updateCount()"
        ></textarea>
      </div>
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
    background_tasks: BackgroundTasks,
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

    # Save feedback to database instantly with status "unprocessed"
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

        logger.info("Queueing background processing for feedback_id=%s", new_feedback.feedback_id)
        background_tasks.add_task(_process_webform_feedback_async, new_feedback.feedback_id)

        logger.info(
            f"Web form feedback received from company_id={integration.company_id}, "
            f"feedback_id={new_feedback.feedback_id}"
        )

        return {
            "message": "Thank you for your feedback! Your complaint has been received."
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
