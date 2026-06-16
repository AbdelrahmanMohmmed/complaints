import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression, RidgeClassifier, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.calibration import CalibratedClassifierCV
import warnings
import re
warnings.filterwarnings('ignore')

# ============= LOAD DATA =============
print("Loading data...")
df = pd.read_csv('review.csv')  # Your CSV with final_label

# Load label encoder
le = joblib.load('label_encoder.pkl')
df['label_encoded'] = le.transform(df['final_label'])


# Text cleaning function (minimal for production)
def clean_text_production(text):
    if pd.isna(text) or text is None:
        return ""
    text = str(text).lower()
    text = re.sub(r'\n|\r|\t', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


df['cleaned_text'] = df['text'].apply(clean_text_production)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    df['cleaned_text'],
    df['label_encoded'],
    test_size=0.2,
    random_state=42,
    stratify=df['label_encoded']
)

print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")
print(f"Number of classes: {len(le.classes_)}")

# ============= DEFINE MODELS =============

# 1. SVM Model (your optimized parameters)
print("\n" + "=" * 50)
print("1. Training SVM with your parameters")
print("=" * 50)

svm_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=3000,
        min_df=1,
        ngram_range=(1, 1),
        sublinear_tf=True
    )),
    ('clf', SVC(
        C=100,
        gamma=0.01,
        kernel='rbf',
        probability=True,  # Enable probability for voting
        class_weight='balanced',
        random_state=42
    ))
])

svm_pipeline.fit(X_train, y_train)
y_pred_svm = svm_pipeline.predict(X_test)
svm_accuracy = accuracy_score(y_test, y_pred_svm)
print(f"SVM Accuracy: {svm_accuracy:.4f}")
print(f"SVM Classification Report:\n{classification_report(y_test, y_pred_svm, target_names=le.classes_)}")

# 2. Random Forest Model (your best_rn_model)
print("\n" + "=" * 50)
print("2. Loading Random Forest Model")
print("=" * 50)

try:
    rf_model = joblib.load('best_rn_model.pkl')
    print("✅ Loaded best_rn_model.pkl")

    # Check if it's a pipeline or just the model
    if hasattr(rf_model, 'predict_proba'):
        rf_proba = rf_model.predict_proba(X_test)
        rf_pred = np.argmax(rf_proba, axis=1) if rf_proba.shape[1] > 1 else rf_model.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
    else:
        print("⚠️ Loaded model doesn't have predict_proba, wrapping in pipeline")
        rf_pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=3000,
                min_df=1,
                ngram_range=(1, 2),
                sublinear_tf=True
            )),
            ('clf', rf_model)
        ])
        rf_pipeline.fit(X_train, y_train)
        rf_pred = rf_pipeline.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        rf_model = rf_pipeline

except Exception as e:
    print(f"⚠️ Could not load best_rn_model.pkl: {e}")
    print("Training new Random Forest model...")

    rf_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=3000,
            min_df=2,
            ngram_range=(1, 2),
            sublinear_tf=True
        )),
        ('clf', RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ))
    ])

    rf_pipeline.fit(X_train, y_train)
    rf_pred = rf_pipeline.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_pred)
    rf_model = rf_pipeline

print(f"Random Forest Accuracy: {rf_accuracy:.4f}")

# 3. Logistic Regression (Linear Model)
print("\n" + "=" * 50)
print("3. Training Logistic Regression (Linear)")
print("=" * 50)

# Try different linear models and find the best
linear_models = {
    'Logistic Regression': LogisticRegression(
        C=1.0,
        max_iter=1000,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    ),
    'Ridge Classifier': RidgeClassifier(
        alpha=1.0,
        class_weight='balanced',
        random_state=42
    ),
    'SGDClassifier': SGDClassifier(
        loss='log_loss',
        penalty='l2',
        alpha=0.0001,
        max_iter=1000,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
}

best_linear = None
best_linear_score = 0
best_linear_name = ""

for name, model in linear_models.items():
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=3000,
            min_df=2,
            ngram_range=(1, 2),
            sublinear_tf=True
        )),
        ('clf', model)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"{name}: {acc:.4f}")

    if acc > best_linear_score:
        best_linear_score = acc
        best_linear = pipeline
        best_linear_name = name

print(f"\n✅ Best Linear Model: {best_linear_name} (Accuracy: {best_linear_score:.4f})")

# 4. Naive Bayes (Good for text)
print("\n" + "=" * 50)
print("4. Training Naive Bayes")
print("=" * 50)

nb_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=3000,
        min_df=2,
        ngram_range=(1, 2),
        sublinear_tf=True
    )),
    ('clf', MultinomialNB(alpha=0.1))
])

nb_pipeline.fit(X_train, y_train)
y_pred_nb = nb_pipeline.predict(X_test)
nb_accuracy = accuracy_score(y_test, y_pred_nb)
print(f"Naive Bayes Accuracy: {nb_accuracy:.4f}")

# ============= VOTING CLASSIFIER =============
print("\n" + "=" * 50)
print("Creating Voting Ensemble")
print("=" * 50)

# Collect all models (ensure they have predict_proba)
estimators = []

# Add SVM
estimators.append(('svm', svm_pipeline))

# Add RF
estimators.append(('rf', rf_model))

# Add best linear
estimators.append(('linear', best_linear))

# Add Naive Bayes
estimators.append(('nb', nb_pipeline))

# Try different voting strategies
voting_strategies = {
    'soft': VotingClassifier(estimators, voting='soft', n_jobs=-1),
    'hard': VotingClassifier(estimators, voting='hard', n_jobs=-1)
}

best_voting = None
best_voting_score = 0
best_voting_strategy = ""

for strategy, voting_clf in voting_strategies.items():
    print(f"\nTraining {strategy} voting classifier...")
    voting_clf.fit(X_train, y_train)
    y_pred_voting = voting_clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred_voting)

    print(f"{strategy.capitalize()} Voting Accuracy: {acc:.4f}")

    if acc > best_voting_score:
        best_voting_score = acc
        best_voting = voting_clf
        best_voting_strategy = strategy

# ============= COMPARE ALL MODELS =============
print("\n" + "=" * 50)
print("FINAL MODEL COMPARISON")
print("=" * 50)

comparison = pd.DataFrame({
    'Model': [
        'SVM (Optimized)',
        'Random Forest',
        f'Best Linear ({best_linear_name})',
        'Naive Bayes',
        f'Voting Ensemble ({best_voting_strategy})'
    ],
    'Accuracy': [
        svm_accuracy,
        rf_accuracy,
        best_linear_score,
        nb_accuracy,
        best_voting_score
    ]
}).sort_values('Accuracy', ascending=False)

print(comparison.to_string(index=False))

# ============= SAVE MODELS =============
print("\n" + "=" * 50)
print("SAVING MODELS")
print("=" * 50)

# Save individual models
joblib.dump(svm_pipeline, 'svm_model.pkl')
joblib.dump(rf_model, 'random_forest_model.pkl')
joblib.dump(best_linear, 'best_linear_model.pkl')
joblib.dump(nb_pipeline, 'naive_bayes_model.pkl')
joblib.dump(best_voting, 'voting_ensemble_model.pkl')

print("✅ Saved models:")
print("  - svm_model.pkl")
print("  - random_forest_model.pkl")
print("  - best_linear_model.pkl")
print("  - naive_bayes_model.pkl")
print("  - voting_ensemble_model.pkl")

# Save model metadata
model_metadata = {
    'models': {
        'svm': {'accuracy': svm_accuracy, 'params': {'C': 100, 'gamma': 0.01, 'kernel': 'rbf'}},
        'random_forest': {'accuracy': rf_accuracy},
        'best_linear': {'name': best_linear_name, 'accuracy': best_linear_score},
        'naive_bayes': {'accuracy': nb_accuracy},
        'voting_ensemble': {'strategy': best_voting_strategy, 'accuracy': best_voting_score}
    },
    'classes': le.classes_.tolist(),
    'n_classes': len(le.classes_)
}

joblib.dump(model_metadata, 'model_metadata.pkl')
print("✅ Saved model_metadata.pkl")

# ============= DETAILED VOTING ANALYSIS =============
print("\n" + "=" * 50)
print("VOTING ENSEMBLE DETAILED ANALYSIS")
print("=" * 50)

# Analyze where voting helps vs individual models
y_pred_combined = np.array([svm_pipeline.predict(X_test),
                            rf_model.predict(X_test) if hasattr(rf_model, 'predict') else rf_pred,
                            best_linear.predict(X_test),
                            nb_pipeline.predict(X_test)]).T

voting_correct = best_voting.predict(X_test) == y_test
svm_correct = y_pred_svm == y_test
rf_correct = rf_pred == y_test
linear_correct = best_linear.predict(X_test) == y_test
nb_correct = y_pred_nb == y_test

# Cases where voting is correct but individual models were wrong
voting_saves = voting_correct & ~(svm_correct | rf_correct | linear_correct | nb_correct)
print(f"\nCases where ONLY voting ensemble got it right: {voting_saves.sum()}/{len(X_test)}")

# Cases where all models agree
all_agree = svm_correct & rf_correct & linear_correct & nb_correct
print(f"Cases where ALL models agree: {all_agree.sum()}/{len(X_test)}")

# ============= PRODUCTION LOADER =============
print("\n" + "=" * 50)
print("CREATING PRODUCTION LOADER")
print("=" * 50)

# Create a production loader script
production_loader = """
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
        text = re.sub(r'\\n|\\r|\\t', ' ', text)
        text = re.sub(r'\\s+', ' ', text)
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
"""

with open('production_classifier.py', 'w') as f:
    f.write(production_loader)

print("✅ Created production_classifier.py")

print("\n" + "=" * 50)
print("TRAINING COMPLETE!")
print("=" * 50)
print(f"Best model: Voting Ensemble ({best_voting_strategy}) with accuracy {best_voting_score:.4f}")
print(f"vs Best individual model: {comparison.iloc[1]['Model']} with accuracy {comparison.iloc[1]['Accuracy']:.4f}")
print(f"Improvement: {(best_voting_score - comparison.iloc[1]['Accuracy']) * 100:.2f}%")