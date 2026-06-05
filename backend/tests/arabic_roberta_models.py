import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.arabic.transformer_predict import *

if __name__ == "__main__":
    word = "انا احب الاكل المالح"
    print("Starting test...")

    try:
        pt = predict_arabert(word,"P")
        print(pt)
        s = predict_arabert(word,"S")
        print(s)
        e = predict_arabert(word,"E")
        print(e)
    except Exception as e:
        import traceback

