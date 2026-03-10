import bcrypt
from cryptography.fernet import Fernet
from .config import settings

def hash(password: str) -> str:
    if not password:
        return None
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

# Encryption utilities for API keys
def get_cipher():
    """Get Fernet cipher using secret key from config"""
    # Use first 32 bytes of secret key and base64 encode for Fernet
    import base64
    key_material = settings.secret_key.encode('utf-8')[:32]
    # Pad if necessary and create a valid Fernet key
    key = base64.urlsafe_b64encode(key_material.ljust(32, b'\0'))
    return Fernet(key)

def encrypt_api_key(api_key: str) -> str:
    """Encrypt API key using Fernet symmetric encryption"""
    cipher = get_cipher()
    encrypted = cipher.encrypt(api_key.encode('utf-8'))
    return encrypted.decode('utf-8')

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key using Fernet symmetric encryption"""
    cipher = get_cipher()
    decrypted = cipher.decrypt(encrypted_key.encode('utf-8'))
    return decrypted.decode('utf-8')