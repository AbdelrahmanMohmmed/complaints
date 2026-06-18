# Focused Model Test Suite

This test suite validates your specific AI models with Arabic and English sentences.

## Models Tested

- **English Sentiment**: `distilroberta-finetuned-financial-news-sentiment-analysis`
- **Arabic Sentiment**: `bert-base-arabic-camelbert-da-sentiment`
- **Multilingual Emotion**: `multilingual-emotion-classification`
- **English Representation**: FastText embeddings
- **Arabic Representation**: FastText embeddings
- **Problem Type Classifiers**: SVM models (English & Arabic)

## Setup Instructions

### 1. Install Required Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install required packages
pip install torch transformers fasttext scikit-learn python-dotenv
```

Or use the requirements file:
```bash
pip install -r ../requirements.txt
```

### 2. Verify Environment Variables

Make sure your `.env` file (in the `backend/` directory) contains:

```env
EN_SENTIMENT_HuggingFace_PATH=C:\hf_cache\distilroberta-finetuned-financial-news-sentiment-analysis
AR_SENTIMENT_HF_MODEL=C:\hf_cache\bert-base-arabic-camelbert-da-sentiment
MULTILINGUAL_EMOTION_HF_MODEL=C:\hf_cache\multilingual-emotion-classification
MULTILINGUAL_EMOTION_THRESHOLD=0.5

EN_FASTTEXT_PATH=C:\Users\Aliel\models\representations\fasttext_model.bin
AR_FASTTEXT_PATH=C:\Users\Aliel\models\representations\fasttext_model_Ara.bin

EN_PROBLEM_SVM_PATH=C:\Users\Aliel\models\english\problem_type\Hypertuned_SVM2.pkl
AR_PROBLEM_SVM_A_PATH=C:\Users\Aliel\models\arabic\problem_type\A_Best_Hypertuned_SVM.pkl
```

### 3. Run the Tests

```bash
python test_focused_models.py
```

## Test Output Example

```
================================================================================
                  FOCUSED MODEL TEST SUITE - SELECTED MODELS ONLY
================================================================================

[DEPENDENCY CHECK]
  ✓ PyTorch installed
  ✓ FastText installed
  ✓ scikit-learn installed
  ✓ Transformers installed

✓ All dependencies available, running tests...

[TEST 1: MODEL LOADING VERIFICATION]
  ✓ EN_SENTIMENT_HuggingFace_PATH       configured
  ✓ AR_SENTIMENT_HF_MODEL               configured
  ...

[TEST 2: FASTTEXT REPRESENTATIONS]
  ✓ English FastText shape: (1, 100) (expected: (1, 100))
  ✓ Arabic FastText shape: (1, 100) (expected: (1, 100))

[TEST 3: HUGGINGFACE SENTIMENT MODELS]
  ✓ Negative Service Complaint          → Negative (expected: Negative)
  ✓ Positive Food Feedback              → Positive (expected: Positive)
  ...

[TEST 4: MULTILINGUAL EMOTION MODEL]
  ✓ Negative Service Complaint          → anger
  ✓ Positive Food Feedback              → joy
  ...

[TEST 5: SVM PROBLEM TYPE CLASSIFIERS]
  ✓ Negative Service Complaint          → Service Quality (expected: True)
  ✓ Positive Food Feedback              → None (expected: False)
  ...

================================================================================
TEST SUMMARY
================================================================================
✓ PASS   | Model Loading
✓ PASS   | FastText Representations
✓ PASS   | HuggingFace Sentiment
✓ PASS   | Multilingual Emotion
✓ PASS   | SVM Problem Type

TOTAL: 5/5 tests passed (100%)

✓ ✓ ✓ ALL TESTS PASSED - YOUR MODELS ARE WORKING CORRECTLY ✓ ✓ ✓
```

## Test Coverage

| Test | Purpose |
|------|---------|
| Model Loading | Verifies all model paths are configured and accessible |
| FastText | Tests English & Arabic text embeddings |
| HuggingFace Sentiment | Tests sentiment prediction for both languages |
| Multilingual Emotion | Tests emotion classification |
| SVM Problem Type | Tests problem type classification using AraBERT embeddings |

## Troubleshooting

### PyTorch Installation Issues

If you encounter CUDA-related issues, install CPU-only PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### Missing Model Files

If models fail to load, check:
1. Model file paths in `.env` are correct
2. Files actually exist at those paths
3. Permissions allow reading the files

### CUDA Out of Memory

If you see memory errors with GPU:
```python
# The test will automatically use CPU if CUDA is unavailable
```

## Test Cases

### English Test Sentences
- Negative Service Complaint
- Positive Food Feedback
- Neutral Experience
- Negative Quality Complaint
- Angry Delivery Complaint

### Arabic Test Sentences
- Negative Delivery Complaint
- Positive Feedback
- Quality Complaint
- Neutral Opinion

All sentences include expected sentiment and problem type classifications for validation.
