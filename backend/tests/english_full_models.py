import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.english.ensemble import *

if __name__ == '__main__':
    text = "i love this food"
    p5 = predict_english_ml_probs(en_problem_svm, text)
    print(p5)
    p4 = predict_english_ml_probs(en_problem_rf, text)
    print(p4)
    p3 = predict_english_ml_probs(en_problem_lr, text)
    print(p3)
    p1 = predict_english_transformer_probs(text, "roberta_problem")  # RoBERTa second
    print(p1)
    print('emtion')
    p1 = predict_english_transformer_probs(text, "roberta_emotion")
    print(p1)
    # Model 2: BiLSTM (emotion)
    p2 = predict_english_dl_probs(en_emotion_bilstm, text)
    print(p2)
    # Model 3: LR (emotion)
    p3 = predict_english_ml_probs(en_emotion_lr, text)
    print(p3)
    print('sentiment')
    p1 = predict_english_transformer_probs(text, "roberta_sentiment")
    print(p1)

    # Model 2: SVM (sentiment) - with fallback for models without probability support
    try:
        p2 = predict_english_ml_probs(en_sentiment_svm, text)
        print(p2)
    except Exception as e:
        logger.warning(
            f"SVM sentiment prediction failed: {str(e)}, using uniform distribution"
        )
        p2 = np.ones((1, 3)) / 3  # Uniform distribution for 3 classes

    # Model 3: GRU (sentiment)
    p3 = predict_english_dl_probs(en_sentiment_gru, text)
    print(p3)

