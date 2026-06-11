import bcrypt ,logging,random,base64
from cryptography.fernet import Fernet
import smtplib ,ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings
from functools import lru_cache
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


logger = logging.getLogger(__name__)

def set_verification_code(user, db: Session, minutes: int = 15) -> str:
    code = generate_verification_code()
    user.verification_code = code
    user.verification_expires_at = datetime.utcnow() + timedelta(minutes=minutes)
    db.commit()
    return code

def generate_verification_code() -> str:
    return str(random.randint(100000, 999999))

def hash_password(password: str) -> str:
    if not password:
        raise Exception("Password cannot be empty")
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )

# Encryption utilities for API keys
@lru_cache(maxsize=1)
def get_cipher():
    """Get Fernet cipher using secret key from config"""
    # Use first 32 bytes of secret key and base64 encode for Fernet
    key_material = settings.secret_key.encode("utf-8")[:32]
    # Pad if necessary and create a valid Fernet key
    key = base64.urlsafe_b64encode(key_material.ljust(32, b"\0"))
    return Fernet(key)

def encrypt_api_key(api_key: str) -> str:
    """Encrypt API key using Fernet symmetric encryption"""
    cipher = get_cipher()
    encrypted = cipher.encrypt(api_key.encode("utf-8"))
    return encrypted.decode("utf-8")

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key using Fernet symmetric encryption"""
    cipher = get_cipher()
    decrypted = cipher.decrypt(encrypted_key.encode("utf-8"))
    return decrypted.decode("utf-8")

def _send_code_email(
    to_email: str,
    code: str,
    name: str,
    *,
    subject: str,
    title: str,
    body: str,
    color: str,
):
    gmail_user = settings.gmail_user
    gmail_password = settings.gmail_app_password

    if not gmail_user or not gmail_password:
        raise Exception("Gmail credentials not configured in .env")

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; 
                padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: {color}; margin-bottom: 8px;">{title}</h2>
        <p style="color: #374151;">Hi <strong>{name}</strong>,</p>
        <p style="color: #374151;">{body}</p>
        <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; 
                         color: {color};">{code}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, 
           you can safely ignore this email.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    logger.info("Sending %s email to %s via Gmail SMTP", subject, to_email)
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
        logger.info("Email sent to %s", to_email)
    except smtplib.SMTPAuthenticationError as e:
        logger.error("Gmail auth failed for %s: %s", gmail_user, str(e), exc_info=True)
        raise
    except Exception as e:
        logger.error("SMTP send failed to %s: %s", to_email, str(e), exc_info=True)
        raise


def send_verification_email(to_email: str, code: str, name: str):
    _send_code_email(
        to_email, code, name,
        subject="Your Ara2kom Verification Code",
        title="Welcome to Ara2kom AI 👋",
        body="Use the code below to verify your email address. It expires in <strong>15 minutes</strong>.",
        color="#1d4ed8",
    )


def send_reset_email(to_email: str, code: str, name: str):
    _send_code_email(
        to_email, code, name,
        subject="Ara2kom Password Reset Code",
        title="Password Reset Request 🔐",
        body="We received a request to reset your password. Use the code below. It expires in <strong>15 minutes</strong>.",
        color="#dc2626",
    )
