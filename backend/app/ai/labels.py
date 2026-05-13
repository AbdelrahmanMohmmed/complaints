"""Label mappings for AI classifications."""

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
