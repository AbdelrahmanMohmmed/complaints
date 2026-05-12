import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def score(problem_type: str, emotion: str, sentiment: str):

    """
    Docstring for score function: 
        Convert labels from each predicted class into a priority score
        and this socre is converted to an appropriate label.
    
    Params:
        problem_type (str): label for class problem type
        emotion (str): label for class emotion
        sentiment (str): label for class sentiment
        
    Return Values:
        Priority label (str): the final label (Critical, High, Medium and Low)
    
    """
    
    problem_severity = {
        "Hygiene": 1.00,
        "Pricing": 0.35,
        "Service Quality": 0.60,
        "Delivery Issue": 0.70,
        "Order Accuracy": 0.80,
        "Food Quality": 0.90,
        None: 0.00
    }

    sentiment_score = {
        "Negative": 1.0,
        "Neutral": 0.0,
        "Positive": -1.0
    }

    emotion_score = {
        "Frustrated": 1.0,
        "Disgusted": 0.9,
        "Neutral": 0.0,
        "Satisfied": -1
    }

    # Weights to determine which classes are important to us
    w_problem = 2.0
    w_sentiment = 1.5
    w_emotion = 1.2

    bias = -2

    z = (
        bias +
        w_problem * problem_severity[problem_type] +
        w_sentiment * sentiment_score[sentiment] +
        w_emotion * emotion_score[emotion]
    )

    # Transform value into probability
    prob = sigmoid(z) * 100
    
    # Mapping probs to each appropriate lables
    if prob >= 75:
        priority = "Critical"
    elif prob >= 50:
        priority = "High"
    elif prob >= 25:
        priority = "Medium"
    else:
        priority = "Low"

    return priority