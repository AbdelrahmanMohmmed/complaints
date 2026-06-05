# arabic_full_models.py
import subprocess
import sys
import os

# Get the project root (adjust if your structure differs)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

word = "انا احب الاكل المالح"

# Run TF/Keras models in separate process
print("=== ML/DL Models (TensorFlow) ===")
result1 = subprocess.run([
    sys.executable, "-c", 
    f'''
import sys, os
sys.path.insert(0, r"{PROJECT_ROOT}")
from app.ai.arabic.ml_dl_predict import *

word = "{word}"
print(predict_arabic_dl(ar_problem_gru(), word, "P"))
print(predict_arabic_ml(ar_problem_lr_f(), word, "P"))
print(predict_arabic_ml(ar_emotion_lr_f(), word, "E"))
print(predict_arabic_dl(ar_sentiment_bilstm(), word, "S"))
'''
], capture_output=False, text=True)

# Run PyTorch models in separate process
print("\n=== Transformer Models (PyTorch) ===")
result2 = subprocess.run([
    sys.executable, "-c",
    f'''
import sys, os
sys.path.insert(0, r"{PROJECT_ROOT}")
from app.ai.arabic.transformer_predict import *

word = "{word}"
print(predict_arabert(word, "P"))
print(predict_arabert(word, "S"))
print(predict_arabert(word, "E"))
'''
], capture_output=False, text=True)