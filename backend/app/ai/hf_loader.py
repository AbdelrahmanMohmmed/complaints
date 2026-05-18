"""Hugging Face model downloader / local loader utilities.

Functions here will download a model + tokenizer from the Hugging Face Hub
and save them to a local directory specified by an environment variable
or a default path. If the model already exists locally, it will be loaded
from disk instead of re-downloading.

Usage:
    from app.ai.hf_loader import get_text_classification_pipeline
    pipe = get_text_classification_pipeline(
        "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis",
        env_path_var="EN_ROBERTA_SENTIMENT_PATH",
    )
    result = pipe("I like you. I love you")
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    pipeline,
)
from huggingface_hub import login as hf_login

logger = logging.getLogger(__name__)


def _get_hf_token() -> Optional[str]:
    """Return HF token found in environment, if any.

    Checks several common environment variable names.
    """
    keys = [
        "HF_TOKEN",
        "HUGGINGFACEHUB_API_TOKEN",
        "HUGGING_FACE_TOKEN",
        "HUGGING_FACE_API_TOKEN",
        "hugging_face_token",
        "hugging_face_token",
    ]
    for k in keys:
        v = os.environ.get(k)
        if v:
            return v
    return None


def _is_model_dir(path: str) -> bool:
    """Rudimentary check whether a directory contains a HF model/tokenizer.

    We look for config.json and at least one model file + tokenizer config.
    """
    if not path or not os.path.isdir(path):
        return False
    files = set(os.listdir(path))
    if "config.json" not in files:
        return False
    has_tokenizer = any(
        x in files
        for x in (
            "tokenizer.json",
            "vocab.json",
            "spiece.model",
            "tokenizer_config.json",
            "merges.txt",
        )
    )
    has_model = any(
        x in files
        for x in (
            "pytorch_model.bin",
            "tf_model.h5",
            "flax_model.msgpack",
            "model.safetensors",
        )
    )
    return has_tokenizer or has_model


def download_and_save(
    model_name: str, target_dir: str, use_auth_token: Optional[str] = None
) -> None:
    """Download tokenizer and model from Hugging Face and save to `target_dir`.

    Args:
        model_name: model identifier on HF hub (e.g. 'distilroberta-base').
        target_dir: local directory to save files into (will be created).
        use_auth_token: optional HF token to access private models.
    """
    os.makedirs(target_dir, exist_ok=True)
    logger.info("Downloading tokenizer for %s -> %s", model_name, target_dir)
    # huggingface_hub handles authentication via login() or env var
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    logger.info("Downloading model for %s -> %s", model_name, target_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)

    logger.info("Saving tokenizer to %s", target_dir)
    tokenizer.save_pretrained(target_dir)
    logger.info("Saving model to %s", target_dir)
    model.save_pretrained(target_dir)


def load_from_local(path: str):
    """Load tokenizer and model from a local directory and return a pipeline."""
    logger.info("Loading tokenizer/model from local path: %s", path)
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    return pipeline("text-classification", model=model, tokenizer=tokenizer)


def get_text_classification_pipeline(
    model_name: str,
    env_path_var: Optional[str] = None,
    default_root: Optional[str] = None,
):
    """Return a `text-classification` pipeline.

    If `env_path_var` is provided and the environment variable exists it will be
    used as the target path to store/load the model. Otherwise a default path
    under the project `models/hf/` will be used.

    The function will not re-download if the model already exists locally.
    """
    # Resolve target dir
    if env_path_var and os.environ.get(env_path_var):
        target = os.environ.get(env_path_var)
    else:
        safe_name = model_name.replace("/", "_")
        root = default_root or os.path.join(os.getcwd(), "models", "hf")
        target = os.path.join(root, safe_name)

    # If already downloaded, load from local
    if _is_model_dir(target):
        logger.info("Model appears downloaded at %s, loading locally", target)
        return load_from_local(target)

    # Otherwise download using HF token if available
    token = _get_hf_token()
    try:
        if token:
            try:
                hf_login(token)
            except Exception:
                logger.debug("hf_login failed; proceeding without explicit login")
        download_and_save(model_name, target)
        return load_from_local(target)
    except Exception as e:
        logger.exception("Failed to download model %s: %s", model_name, str(e))
        # As a fallback, try to load directly from hub (this may stream from cache)
        logger.info("Falling back to direct from_pretrained for %s", model_name)
        if token:
            try:
                hf_login(token)
            except Exception:
                logger.debug(
                    "hf_login failed in fallback; proceeding without explicit login"
                )
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        return pipeline("text-classification", model=model, tokenizer=tokenizer)
