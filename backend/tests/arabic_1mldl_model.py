import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.arabic.ml_dl_predict import *


if __name__ == "__main__":
    text = "انا احب الاكل المالح"
    print("Starting test...")

    try:

        pt = predict_arabic_dl(ar_problem_gru(), text, "P")
        print(pt)
        pt = predict_arabic_ml(ar_problem_lr_f(), text, "P")
        print(pt)
        s = predict_arabic_ml(ar_emotion_lr_f(), text, "E")
        print(s)
        s = predict_arabic_dl(ar_emotion_bilstm(), text, "E")
        print(s)
        e = predict_arabic_dl(ar_sentiment_bilstm(), text, "S")  # BiLSTM
        print(e)


    except Exception as e:
        import traceback

