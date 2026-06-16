
import joblib
import re
import pandas as pd
import numpy as np

class ProductionClassifier:
    def __init__(self, model_type='voting_ensemble'):
        # Load the best model (voting ensemble by default)
        if model_type == 'voting_ensemble':
            self.model = joblib.load('voting_ensemble_model.pkl')
        elif model_type == 'svm':
            self.model = joblib.load('svm_model.pkl')
        elif model_type == 'random_forest':
            self.model = joblib.load('random_forest_model.pkl')
        elif model_type == 'linear':
            self.model = joblib.load('best_linear_model.pkl')
        else:
            self.model = joblib.load('voting_ensemble_model.pkl')

        self.encoder = joblib.load('label_encoder.pkl')
        self.metadata = joblib.load('model_metadata.pkl')

    def clean_text(self, text):
        if pd.isna(text) or text is None:
            return ""
        text = str(text).lower()
        text = re.sub(r'\n|\r|\t', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def predict(self, text):
        cleaned = self.clean_text(text)
        pred_encoded = self.model.predict([cleaned])[0]
        return self.encoder.inverse_transform([pred_encoded])[0]

    def predict_proba(self, text):
        cleaned = self.clean_text(text)
        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba([cleaned])[0]
            return dict(zip(self.metadata['classes'], proba))
        else:
            return None

    def predict_batch(self, texts):
        cleaned = [self.clean_text(t) for t in texts]
        preds_encoded = self.model.predict(cleaned)
        return self.encoder.inverse_transform(preds_encoded)

# Usage
if __name__ == "__main__":
    classifier = ProductionClassifier('voting_ensemble')

    # Test
    test_text = "The battery died after 2 hours"
    prediction = classifier.predict(test_text)
    print(f"Prediction: {prediction}")
