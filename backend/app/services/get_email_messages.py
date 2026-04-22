import email
import imaplib
from datetime import datetime, timezone
from email.message import Message
from email.utils import parsedate_to_datetime, parseaddr


def _extract_plain_text(msg: Message) -> str:
    """Extract the first text/plain body from an email message."""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition") or "").lower()
            if content_type == "text/plain" and "attachment" not in disposition:
                payload = part.get_payload(decode=True)
                if payload is None:
                    continue
                charset = part.get_content_charset() or "utf-8"
                return payload.decode(charset, errors="replace").strip()
        return ""

    payload = msg.get_payload(decode=True)
    if payload is None:
        return ""
    charset = msg.get_content_charset() or "utf-8"
    return payload.decode(charset, errors="replace").strip()


def _normalize_datetime(date_header: str | None) -> datetime:
    """Convert email Date header to naive UTC datetime for DB storage."""
    if not date_header:
        return datetime.utcnow()
    try:
        parsed = parsedate_to_datetime(date_header)
        if parsed.tzinfo is None:
            return parsed
        return parsed.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        return datetime.utcnow()


def fetch_gmail_messages(
    username: str,
    password: str,
    mailbox: str = "INBOX",
    max_messages: int = 50,
    from_filter: str | None = None,
) -> list[dict]:
    """
    Fetch Gmail messages via IMAP and return structured payloads.

    Returns list items with keys:
    - from_name
    - from_email
    - subject
    - body
    - created_at (naive UTC datetime)
    """
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    messages: list[dict] = []

    try:
        mail.login(username, password)
        mail.select(mailbox)

        if from_filter:
            status, data = mail.search(None, "FROM", f'"{from_filter}"')
        else:
            status, data = mail.search(None, "ALL")

        if status != "OK" or not data:
            return messages

        message_ids = data[0].split()
        for message_id in reversed(message_ids[-max_messages:]):
            status, fetched_data = mail.fetch(message_id, "(RFC822)")
            if status != "OK" or not fetched_data:
                continue

            for response_part in fetched_data:
                if not isinstance(response_part, tuple):
                    continue

                msg = email.message_from_bytes(response_part[1])
                sender_name, sender_email = parseaddr(msg.get("From", ""))
                body = _extract_plain_text(msg)
                if not body:
                    continue

                messages.append(
                    {
                        "from_name": sender_name.strip(),
                        "from_email": sender_email.strip(),
                        "subject": (msg.get("Subject") or "").strip(),
                        "body": body,
                        "created_at": _normalize_datetime(msg.get("Date")),
                    }
                )

        return messages
    finally:
        try:
            mail.logout()
        except Exception:
            pass
