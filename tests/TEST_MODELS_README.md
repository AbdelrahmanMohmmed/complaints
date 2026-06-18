# Model Test Suite Documentation

## Overview
This test suite comprehensively tests all 9 models in your complaints system:

1. **FastText** - Text representation/embedding (English)
2. **AraBERT** - Text representation/embedding (Arabic)
3. **BERT** - Problem type classification
4. **RoBERTa** - Problem type classification
5. **ML Models** - SVC, RandomForest, LogisticRegression, XGBClassifier
6. **DL Models** - GRU, BiLSTM (for sentiment, emotion, problem type)
7. **Ensemble Voting** - Combines multiple models with hard/soft voting
8. **English Priority Scoring** - Calculates priority (Critical/High/Medium/Low)
9. **Arabic Priority Scoring** - Calculates priority in Arabic context

## Test File Location
```
tests/test_models.py
```

## Running Tests

### Run All Tests
```bash
cd c:\Users\Aliel\complaints
python -m pytest tests/test_models.py -v
```

### Run Specific Test Class
```bash
# Test only BERT model
python -m pytest tests/test_models.py::TestBERTPrediction -v

# Test only priority scoring
python -m pytest tests/test_models.py::TestEnglishPriorityScorig -v
```

### Run Specific Test Method
```bash
# Test only BERT prediction
python -m pytest tests/test_models.py::TestBERTPrediction::test_bert_prediction -v
```

### Run with unittest (Alternative)
```bash
python tests/test_models.py -v
```

### Run with Coverage
```bash
pip install coverage
coverage run -m pytest tests/test_models.py
coverage report
coverage html  # Generates HTML coverage report
```

## Test Classes and Coverage

### 1. TestFastTextRepresentation
- **Model**: FastText (English)
- **Tests**:
  - `test_fasttext_ml_embedding`: Verifies embedding shape (1, 100) for ML models
  - `test_fasttext_dl_embedding`: Verifies padded sequences for DL models

### 2. TestAraBERTRepresentation
- **Model**: AraBERT (Arabic)
- **Tests**:
  - `test_arabert_embedding`: Verifies Arabic text embedding shape (1, 768)

### 3. TestBERTPrediction
- **Model**: BERT (Problem Type Classification)
- **Tests**:
  - `test_bert_prediction`: Tests single prediction output
  - `test_bert_probabilities`: Tests probability output for all 8 classes

### 4. TestRoBERTaPrediction
- **Model**: RoBERTa (Problem Type Classification)
- **Tests**:
  - `test_roberta_prediction`: Tests prediction output

### 5. TestMLDLPredictions
- **Models**: ML (SVC, RF, LR, XGB) & DL (GRU, BiLSTM)
- **Tests**:
  - `test_ml_prediction_problem_type`: Tests ML model prediction
  - `test_ml_prediction_probabilities`: Tests ML model probability predictions
  - `test_dl_prediction_sentiment`: Tests DL model for sentiment classification
  - `test_dl_prediction_emotion`: Tests DL model for emotion classification

### 6. TestEnsembleVoting
- **Model**: Ensemble Voting (combines BERT, RoBERTa, ML, DL)
- **Tests**:
  - `test_ensemble_hard_voting_3_models`: Tests hard voting mechanism
  - `test_ensemble_soft_voting_3_models`: Tests weighted soft voting

### 7. TestEnglishPriorityScorig
- **Model**: English Priority Scoring
- **Tests**:
  - `test_priority_critical`: Tests Critical priority assignment
  - `test_priority_high`: Tests High priority assignment
  - `test_priority_medium`: Tests Medium priority assignment
  - `test_priority_low`: Tests Low priority assignment

### 8. TestArabicPriorityScoring
- **Model**: Arabic Priority Scoring
- **Tests**:
  - `test_priority_critical_ar`: Tests Critical priority (Arabic context)
  - `test_priority_high_ar`: Tests High priority (Arabic context)
  - `test_priority_medium_ar`: Tests Medium priority (Arabic context)
  - `test_priority_low_ar`: Tests Low priority (Arabic context)

### 9. TestModelIntegration
- **Purpose**: Integration tests
- **Tests**:
  - `test_pipeline_flow`: Tests complete pipeline
  - `test_error_handling_invalid_input`: Tests error handling

## Key Features

### Mocking Strategy
The tests use Python's `unittest.mock` to mock:
- External model loading (transformers, tensorflow, sklearn)
- File I/O operations
- GPU availability

This allows testing without requiring actual model files or GPU resources.

### Test Data
- English test text: "The delivery was very late", "Service quality was poor", etc.
- Arabic test text: "الطعام سيء جداً" (The food is very bad)
- Embeddings: Randomly generated to simulate real outputs

### Expected Labels

**Problem Type (8 classes)**:
- Delivery Issue, Food Quality, Hygiene, Service Quality, Pricing, Order Accuracy, Bad Atmosphere, Menu

**Sentiment (3 classes)**:
- Negative, Neutral, Positive

**Emotion (4 classes)**:
- Frustrated, Satisfied, Disgusted, Neutral

**Priority (4 levels)**:
- Critical, High, Medium, Low

## Model Path Configurations

Update model paths in the actual model files if needed:
- `models/Predictions/bert_pred.py`: Line with `BertForSequenceClassification.from_pretrained(...)`
- `models/Predictions/roberta_pred.py`: Line with `RobertaForSequenceClassification.from_pretrained(...)`
- `models/Representations/fasttext_represent.py`: Line with `fasttext.load_model(...)`
- `models/Representations/arabert_represent.py`: Model name configuration

## Requirements

```
pytest>=7.0.0
pytest-cov>=4.0.0
torch>=2.0.0
tensorflow>=2.13.0
transformers>=4.30.0
sklearn>=1.3.0
xgboost>=2.0.0
fasttext>=0.9.2
apscheduler>=3.10.0
```

Install with:
```bash
pip install -r requirements.txt
```

## Troubleshooting

### ImportError: Cannot import models
**Solution**: Ensure model paths are correctly added to sys.path in the test file.

### Mock not working
**Solution**: Verify patch decorators match the import path exactly.

### CUDA/GPU errors
**Solution**: Tests mock GPU availability with `torch.cuda.is_available()`, so GPU is not required.

### Model file not found
**Solution**: This is expected - tests mock the model loading. Actual model paths should be configured in the model files themselves.

## Extending Tests

To add more tests:

1. **Add new test class**:
```python
class TestNewModel(unittest.TestCase):
    def setUp(self):
        """Setup test data"""
        pass
    
    def test_functionality(self):
        """Test a specific functionality"""
        from your_module import function
        result = function(test_input)
        self.assertEqual(result, expected_output)
```

2. **Add to test_models.py** and run with pytest

## CI/CD Integration

To integrate with GitHub Actions or similar CI/CD:

```yaml
# .github/workflows/test.yml
name: Run Model Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - run: pip install -r requirements.txt
      - run: python -m pytest tests/test_models.py -v
```

## Notes

- All model loading is mocked to avoid dependency on actual model files
- Tests verify shape, type, and value correctness
- Priority scoring uses sigmoid function for score calculation
- Ensemble voting supports both hard and soft voting strategies
