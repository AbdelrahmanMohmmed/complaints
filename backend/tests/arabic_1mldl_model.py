import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.arabic.ml_dl_predict import (
    ar_problem_lr_f,ar_emotion_lr_f,ar_sentiment_bilstm
    ,predict_arabic_ml, predict_arabic_dl)


if __name__ == "__main__":
    text = "انا احب الاكل المالح"
    print("Starting test...")

    try:
        pt = predict_arabic_ml(ar_problem_lr_f(), text, "P")
        print(pt)
        s = predict_arabic_ml(ar_emotion_lr_f(), text, "E")
        print(s)
        e = predict_arabic_dl(ar_sentiment_bilstm(), text, "S")  # BiLSTM
        print(e)
    except Exception as e:
        import traceback

