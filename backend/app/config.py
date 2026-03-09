from pydantic_settings import BaseSettings

class Settings (BaseSettings):

    DATABASE_HOSTNAME:str
    DATABASE_PASSWORD:str
    DATABASE_USERNAME:str
    DATABASE_PORT:str
    DATABASE_NAME:str
    secret_key:str
    algorithm:str
    access_token_expire_minutes:int
    model_config = {"env_file": ".env"}
    
settings = Settings()
