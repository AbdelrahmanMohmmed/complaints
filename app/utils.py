from passlib.context import CryptContext

# Define the context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash(password: str):
    # Ensure the password is not empty and is encoded to bytes
    if not password:
        return None
    return pwd_context.hash(password)

def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)