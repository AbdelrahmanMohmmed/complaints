from pydantic_settings import BaseSettings
import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent

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

    # Frontend base URL for OAuth redirects
    FRONTEND_BASE_URL: str = "http://localhost:5173"

    # ========================================================================
    # Arabic ML/DL Models (FastText Representation)
    # IMPORTANT: Different models for each task (Problem Type, Emotion, Sentiment)
    # ========================================================================
    AR_FASTTEXT_PATH: str = ""
    AR_TOKENIZER_PATH: str = ""

    # Problem Type Models (arabert_67)
    AR_PROBLEM_LR_F_PATH: str = ""  # F_Best_Hypertuned_LR.pkl (problem type version)
    AR_PROBLEM_GRU_PATH: str = ""  # Best_Hypertuned_GRU.keras (problem type version)
    AR_PROBLEM_LR_A_PATH: str = ""  # A_Best_Hypertuned_LR.pkl (problem type version)
    AR_PROBLEM_SVM_A_PATH: str = ""  # A_Best_Hypertuned_SVM.pkl (problem type version)

    # Emotion Models (arabert_70)
    AR_EMOTION_LR_F_PATH: str = ""  # F_Best_Hypertuned_LR.pkl (emotion version)
    AR_EMOTION_BILSTM_PATH: str = ""  # Best_Hypertuned_Bi_LSTM.keras (emotion version)
    AR_EMOTION_LR_A_PATH: str = ""  # A_Best_Hypertuned_LR.pkl (emotion version)
    AR_EMOTION_SVM_A_PATH: str = ""  # A_Best_Hypertuned_SVM.pkl (emotion version)

    # Sentiment Models (arabert_85)
    AR_SENTIMENT_LR_F_PATH: str = ""  # F_Best_Hypertuned_LR.pkl (sentiment version)
    AR_SENTIMENT_BILSTM_PATH: str = (
        ""  # Best_Hypertuned_Bi_LSTM.keras (sentiment version)
    )
    AR_SENTIMENT_SVM_A_PATH: str = ""  # A_Best_Hypertuned_SVM.pkl (sentiment version)
    AR_SENTIMENT_LR_A_PATH: str = ""  # A_Best_Hypertuned_LR.pkl (sentiment version)

    # ========================================================================
    # Arabic Transformer Models (HuggingFace) - Different for each task
    # ========================================================================
    AR_ARABERT_PROBLEM_PATH: str = ""  # arabert_67 (problem type)
    AR_ARABERT_EMOTION_PATH: str = ""  # arabert_70 (emotion)
    AR_ARABERT_SENTIMENT_PATH: str = ""  # arabert_85 (sentiment)

    # ========================================================================
    # English ML/DL Models (FastText Representation)
    # IMPORTANT: Different models for each task (Problem Type, Emotion, Sentiment)
    # ========================================================================
    EN_FASTTEXT_PATH: str = ""
    EN_TOKENIZER_PATH: str = ""

    # Problem Type Models (roberta_70, bert_70)
    EN_PROBLEM_LR_PATH: str = ""  # F_Best_Hypertuned_LR.pkl (problem type, weight 1.6)
    EN_PROBLEM_RF_PATH: str = ""  # F_Best_Hypertuned_RF4.pkl (problem type, weight 1.2)
    EN_PROBLEM_SVM_PATH: str = ""  # Hypertuned_SVM2.pkl (problem type, weight 2.2)

    # Emotion Models (roberta_73_emotion)
    EN_EMOTION_BILSTM_PATH: str = ""  # F_Best_Bi_LSTM.keras (emotion, weight 1.5)
    EN_EMOTION_LR_PATH: str = ""  # F_Best_Hypertuned_LR.pkl (emotion, weight 1.2)

    # Sentiment Models (roberta_73_sentiment)
    EN_SENTIMENT_SVM_PATH: str = ""  # Hypertuned_SVM2.pkl (sentiment, weight 1.5)
    EN_SENTIMENT_GRU_PATH: str = ""  # F_Best_GRU.keras (sentiment, weight 1.2)

    # ============================================================================
    # English Transformer Models (HuggingFace) - Different for each task
    # ============================================================================
    EN_ROBERTA_PROBLEM_PATH: str = ""  # roberta_70 (problem type, weight 2.4)
    EN_ROBERTA_EMOTION_PATH: str = ""  # roberta_73_emotion (emotion, weight 2.0)
    EN_ROBERTA_SENTIMENT_PATH: str = ""  # roberta_73_sentiment (sentiment, weight 2.0)
    EN_BERT_PROBLEM_PATH: str = ""  # bert_70 (problem type only, weight 3.0)

    # Backwards-compatible fields for Hugging Face env vars present in .env
    en_sentiment_huggingface_path: str = ""
    hugging_face_token: str = ""
    # HF model paths
    ar_sentiment_hf_path: str = ""
    en_sentiment_hf_path: str = ""
    multilingual_emotion_hf_path: str = ""

    # HF model names
    ar_sentiment_hf_model: str = ""
    en_sentiment_hf_model: str = ""
    multilingual_emotion_hf_model: str = ""

    # HF threshold
    multilingual_emotion_threshold: float = 0.5
    model_config = {"env_file": os.path.join(BASE_DIR, ".env")
    , "case_sensitive": False}


settings = Settings()
