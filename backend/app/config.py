from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Database configuration
    DATABASE_HOSTNAME: str
    DATABASE_PASSWORD: str
    DATABASE_USERNAME: str
    DATABASE_PORT: str
    DATABASE_NAME: str

    # Authentication configuration
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    gmail_user: str  # ← add
    gmail_app_password: str  # ← add

    # Optional third-party auth for auto-connect/scraping
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    FACEBOOK_REDIRECT_URI: str = ""
    FACEBOOK_PAGE_ACCESS_TOKEN: str = ""
    TWITTER_AUTH_TOKEN: str = ""
    TWITTER_CT0: str = ""

    # ML Model paths (optional - if not provided, models won't be loaded)
    SENTIMENT_MODEL_PATH: str = ""  # Path to SVM sentiment model (.pkl file)
    EMOTION_MODEL_PATH: str = ""  # Path to SVM emotion model (.pkle file)
    FASTTEXT_MODEL_PATH: str = ""  # Path to FastText model (.bin file)
    BERT_MODEL_PATH: str = ""  # Path to BERT problem type model
    ROBERTA_MODEL_PATH: str = ""  # Path to RoBERTa problem type model

    model_config = {"env_file": ".env"}


settings = Settings()
