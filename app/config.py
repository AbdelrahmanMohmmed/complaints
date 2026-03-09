from pydantic_settings import BaseSettings

class Settings (BaseSettings):

    DATABASE_HOSTNAME:str
    DATABASE_PASSWORD:str
    DATABASE_USERNAME:str
    DATABASE_PORT:str
    DATABASE_NAME:str
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MINUTES:str
    model_config = {"env_file": ".env"}
    
settings = Settings()
