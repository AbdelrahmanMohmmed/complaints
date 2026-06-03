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
    gmail_user: str
    gmail_app_password: str

    # Optional third-party auth for auto-connect/scraping
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    FACEBOOK_REDIRECT_URI: str = ""
    FACEBOOK_PAGE_ACCESS_TOKEN: str = ""
    TWITTER_AUTH_TOKEN: str = ""
    TWITTER_CT0: str = ""

    # Frontend base URL for OAuth redirects
    FRONTEND_BASE_URL: str = "http://localhost:5173"

    # Arabic ML/DL Models (FastText Representation)
    AR_FASTTEXT_PATH: str = ""
    AR_TOKENIZER_PATH: str = ""

    # Problem Type Models (arabert_67)
    AR_PROBLEM_LR_F_PATH: str = ""
    AR_PROBLEM_GRU_PATH: str = ""
    AR_PROBLEM_LR_A_PATH: str = ""
    AR_PROBLEM_SVM_A_PATH: str = ""

    # Emotion Models (arabert_70)
    AR_EMOTION_LR_F_PATH: str = ""
    AR_EMOTION_BILSTM_PATH: str = ""
    AR_EMOTION_LR_A_PATH: str = ""
    AR_EMOTION_SVM_A_PATH: str = ""

    # Sentiment Models (arabert_85)
    AR_SENTIMENT_LR_F_PATH: str = ""
    AR_SENTIMENT_BILSTM_PATH: str = ""
    AR_SENTIMENT_SVM_A_PATH: str = ""
    AR_SENTIMENT_LR_A_PATH: str = ""

    # Arabic Transformer Models (HuggingFace)
    AR_ARABERT_PROBLEM_PATH: str = ""
    AR_ARABERT_EMOTION_PATH: str = ""
    AR_ARABERT_SENTIMENT_PATH: str = ""

    # English ML/DL Models (FastText Representation)
    EN_FASTTEXT_PATH: str = ""
    EN_TOKENIZER_PATH: str = ""

    # Problem Type Models (roberta_70, bert_70)
    EN_PROBLEM_LR_PATH: str = ""
    EN_PROBLEM_RF_PATH: str = ""
    EN_PROBLEM_SVM_PATH: str = ""

    # Emotion Models (roberta_73_emotion)
    EN_EMOTION_BILSTM_PATH: str = ""
    EN_EMOTION_LR_PATH: str = ""

    # Sentiment Models (roberta_73_sentiment)
    EN_SENTIMENT_SVM_PATH: str = ""
    EN_SENTIMENT_GRU_PATH: str = ""

    # English Transformer Models (HuggingFace)
    EN_ROBERTA_PROBLEM_PATH: str = ""
    EN_ROBERTA_EMOTION_PATH: str = ""
    EN_ROBERTA_SENTIMENT_PATH: str = ""
    EN_BERT_PROBLEM_PATH: str = ""

    # Backwards-compatible fields
    en_sentiment_huggingface_path: str = ""
    hugging_face_token: str = ""

    # HF-only sentiment/emotion configuration
    AR_sentiment_hf_model: str = "CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment"
    en_sentiment_hf_model: str = "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
    multilingual_emotion_hf_model: str = "tabularisai/multilingual-emotion-classification"
    multilingual_emotion_threshold: float = 0.5

    # Local model paths (NEW - from .env)
    ar_sentiment_hf_path: str = ""
    en_sentiment_hf_path: str = ""
    multilingual_emotion_hf_path: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}


settings = Settings()