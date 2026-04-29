"""
Priority scoring engine based on sentiment and emotion.
Uses rules from SRS section 3.2.6.
"""

import logging

logger = logging.getLogger(__name__)

# Priority scoring rules
PRIORITY_RULES = {
    ("negative", "frustrated"): "Critical",
    ("negative", "disgusted"): "High",
    ("negative", "neutral"): "Medium",
    ("negative", "satisfied"): "Medium",
    ("neutral", "frustrated"): "High",
    ("neutral", "disgusted"): "Medium",
    ("neutral", "neutral"): "Low",
    ("neutral", "satisfied"): "Low",
    ("positive", "frustrated"): "Low",
    ("positive", "neutral"): "Low",
    ("positive", "disgusted"): "Low",
    ("positive", "satisfied"): "Low",
}


def calculate_priority(sentiment: str, emotion: str) -> str:
    """
    Calculate priority based on sentiment and emotion.
    Uses rule-based scoring as per SRS 3.2.6.
    
    Args:
        sentiment: Sentiment label ("negative", "neutral", "positive")
        emotion: Emotion label ("frustrated", "neutral", "disgusted", "satisfied")
        
    Returns:
        Priority label: "Critical", "High", "Medium", or "Low"
    """
    try:
        # Normalize inputs
        sentiment = (sentiment or "").lower().strip()
        emotion = (emotion or "").lower().strip()

        # Look up the priority rule
        key = (sentiment, emotion)
        priority = PRIORITY_RULES.get(key, "Medium")

        logger.debug(f"Priority calculated: {priority} (sentiment={sentiment}, emotion={emotion})")

        return priority

    except Exception as e:
        logger.error(
            f"Error calculating priority (sentiment={sentiment}, emotion={emotion}): {str(e)}",
            exc_info=True,
        )
        # Return default priority on error
        return "Medium"
