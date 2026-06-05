import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.arabic.ensemble import *


if __name__ == "__main__":
    text = "انا احب الاكل المالح"
    print("Starting test...")

    try:
        pt = predict_arabic_problem_type( text)
        print(pt)
        s = predict_arabic_ml(ar_emotion_lr_f(), text, "E")
        print(s)
        e = predict_arabic_dl(ar_sentiment_bilstm(), text, "S")  # BiLSTM
        print(e)
    except Exception as e:
        print(e)

