"""Domain-aware AI model registry."""

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Callable

logger = logging.getLogger(__name__)

_PROVIDER_FUNCTIONS: dict[str, Callable[[str], str]] = {}


def _register_providers() -> None:
    if _PROVIDER_FUNCTIONS:
        return

    from app.ai.arabic.ensemble import (
        predict_arabic_problem_type,
        predict_arabic_emotion,
        predict_arabic_sentiment,
    )
    from app.ai.english.ensemble import (
        predict_english_problem_type,
        predict_english_emotion,
        predict_english_sentiment,
    )

    _PROVIDER_FUNCTIONS.update({
        "arabic_problem_ensemble": predict_arabic_problem_type,
        "english_problem_ensemble": predict_english_problem_type,
        "arabic_sentiment": predict_arabic_sentiment,
        "english_sentiment": predict_english_sentiment,
        "arabic_emotion": predict_arabic_emotion,
        "english_emotion": predict_english_emotion,
    })


@lru_cache(maxsize=1)
def _load_profiles() -> dict:
    path = Path(__file__).with_name("model_profiles.json")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_active_provider(task: str, language: str, domain: str | None = None) -> str:
    """Return first enabled provider for task/language/domain."""
    _register_providers()
    profiles = _load_profiles()
    profile = profiles.get((domain or "default").lower(), profiles.get("default", {}))
    providers = profile.get(task.lower(), {}).get(language.lower(), [])

    for p in providers:
        name = p.get("provider", "")
        if p.get("enabled", True) and name in _PROVIDER_FUNCTIONS:
            return name

    raise ValueError(f"No provider for task='{task}', language='{language}', domain='{domain}'")


def predict_task(task: str, text: str, language: str, domain: str | None = None) -> str:
    """Run prediction using the active provider."""
    provider_name = get_active_provider(task, language, domain)
    logger.info("AI: task=%s lang=%s domain=%s provider=%s", task, language, domain, provider_name)
    return _PROVIDER_FUNCTIONS[provider_name](text)


def list_active_providers(domain: str | None = None) -> dict[str, dict[str, str]]:
    """Show active provider per task/language."""
    result: dict[str, dict[str, str]] = {}
    for task in ("sentiment", "emotion", "problem_type"):
        result[task] = {}
        for language in ("arabic", "english"):
            try:
                result[task][language] = get_active_provider(task, language, domain)
            except ValueError:
                result[task][language] = "unavailable"
    return result