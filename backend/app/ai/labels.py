"""Label mappings for AI classifications."""

from __future__ import annotations

# English label mapping for problem type (8 categories)
PROBLEM_TYPE_ID2LABEL = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
    6: "Bad Atmosphere",
    7: "Menu",
}

PROBLEM_TYPE_DEFAULT_ID = 3
PROBLEM_TYPE_DEFAULT_LABEL = PROBLEM_TYPE_ID2LABEL[PROBLEM_TYPE_DEFAULT_ID]
PROBLEM_TYPE_LABEL2ID = {
    label: label_id for label_id, label in PROBLEM_TYPE_ID2LABEL.items()
}

# Arabic label mapping for problem type (8 categories)
PROBLEM_TYPE_ID2AR_LABEL = {
    0: "مشكله توصيل",
    1: "جودة الطعام",
    2: "النظافة",
    3: "جودة الخدمة",
    4: "الأسعار",
    5: "دقة الطلب",
    6: "أجواء سيئة",
    7: "قائمة الطعام",
}

# English label mapping for emotion (4 categories)
EMOTION_ID2LABEL = {
    0: "frustrated",
    1: "neutral",
    2: "disgusted",
    3: "satisfied",
}

EMOTION_DEFAULT_ID = 1
EMOTION_DEFAULT_LABEL = EMOTION_ID2LABEL[EMOTION_DEFAULT_ID]
EMOTION_LABEL2ID = {label: label_id for label_id, label in EMOTION_ID2LABEL.items()}

# Arabic label mapping for emotion (4 categories)
EMOTION_ID2AR_LABEL = {
    0: "محبط",
    1: "محايد",
    2: "مشمئز",
    3: "راضٍ",
}

# English label mapping for sentiment (3 categories)
SENTIMENT_ID2LABEL = {
    0: "negative",
    1: "neutral",
    2: "positive",
}

SENTIMENT_DEFAULT_ID = 1
SENTIMENT_DEFAULT_LABEL = SENTIMENT_ID2LABEL[SENTIMENT_DEFAULT_ID]
SENTIMENT_LABEL2ID = {label: label_id for label_id, label in SENTIMENT_ID2LABEL.items()}


def get_problem_type_label(
    problem_type_id: int | None, language: str = "en"
) -> str | None:
    if problem_type_id is None:
        return None
    if language.lower().startswith("ar"):
        return PROBLEM_TYPE_ID2AR_LABEL.get(problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL)
    return PROBLEM_TYPE_ID2LABEL.get(problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL)


def get_emotion_label(emotion_id: int | None, language: str = "en") -> str | None:
    if emotion_id is None:
        return None
    if language.lower().startswith("ar"):
        return EMOTION_ID2AR_LABEL.get(emotion_id, EMOTION_DEFAULT_LABEL)
    return EMOTION_ID2LABEL.get(emotion_id, EMOTION_DEFAULT_LABEL)


def get_sentiment_label(sentiment_id: int | None, language: str = "en") -> str | None:
    if sentiment_id is None:
        return None
    return SENTIMENT_ID2LABEL.get(sentiment_id, SENTIMENT_DEFAULT_LABEL)
