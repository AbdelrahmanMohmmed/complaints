"""
Comprehensive test suite for all 9 models in the complaints system.
Tests: BERT, RoBERTa, ML models, DL models, FastText, AraBERT, Ensemble voting, 
and both English & Arabic priority scoring.
"""

import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import numpy as np
import torch
from pathlib import Path

# Add models directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'models', 'Predictions'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'models', 'Representations'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'models', 'Priority_Engines'))


class TestFastTextRepresentation(unittest.TestCase):
    """Test FastText representation model (English embeddings)"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.test_text = "The food quality was very bad"
        self.test_text_ar = "الطعام سيء جداً"
    
    @patch('fasttext.load_model')
    @patch('pickle.load')
    def test_fasttext_ml_embedding(self, mock_pickle, mock_fasttext):
        """Test FastText embedding for ML models"""
        # Mock the fasttext model
        mock_model = MagicMock()
        mock_model.get_sentence_vector.return_value = np.random.rand(100)
        mock_fasttext.return_value = mock_model
        
        from fasttext_represent import embedd
        
        # Test embedding for ML
        embedding = embedd(self.test_text, for_ML=True)
        
        # Assertions
        self.assertIsInstance(embedding, np.ndarray)
        self.assertEqual(embedding.shape, (1, 100))
        mock_model.get_sentence_vector.assert_called_once_with(self.test_text)
    
    @patch('fasttext.load_model')
    @patch('pickle.load')
    def test_fasttext_dl_embedding(self, mock_pickle, mock_fasttext):
        """Test FastText embedding for DL models (padded sequences)"""
        # Mock fasttext model
        mock_model = MagicMock()
        mock_model.get_sentence_vector.return_value = np.random.rand(100)
        mock_fasttext.return_value = mock_model
        
        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.texts_to_sequences.return_value = [[1, 2, 3, 4, 5]]
        mock_pickle.return_value = mock_tokenizer
        
        from fasttext_represent import embedd
        
        # Test embedding for DL
        embedding = embedd(self.test_text, for_ML=False)
        
        # Assertions
        self.assertIsInstance(embedding, np.ndarray)
        self.assertEqual(embedding.shape[0], 1)  # Batch size


class TestAraBERTRepresentation(unittest.TestCase):
    """Test AraBERT representation model (Arabic embeddings)"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.test_text_ar = "الطعام سيء جداً"
    
    @patch('torch.cuda.is_available')
    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForSequenceClassification.from_pretrained')
    def test_arabert_embedding(self, mock_model_load, mock_tokenizer_load, mock_cuda):
        """Test AraBERT embedding generation"""
        mock_cuda.return_value = False
        
        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.return_value = {
            'input_ids': torch.tensor([[101, 1234, 567]]),
            'token_type_ids': torch.tensor([[0, 0, 0]]),
            'attention_mask': torch.tensor([[1, 1, 1]])
        }
        mock_tokenizer_load.return_value = mock_tokenizer
        
        # Mock model
        mock_model = MagicMock()
        mock_output = MagicMock()
        mock_output.last_hidden_state = torch.randn(1, 128, 768)
        mock_model.bert.return_value = mock_output
        mock_model_load.return_value = mock_model
        
        from arabert_represent import embedd
        
        # Test embedding
        embedding = embedd(self.test_text_ar)
        
        # Assertions
        self.assertIsInstance(embedding, np.ndarray)
        self.assertEqual(embedding.shape, (1, 768))


class TestBERTPrediction(unittest.TestCase):
    """Test BERT model for problem type classification"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.test_text = "The delivery was very late"
        self.expected_labels = ["Delivery Issue", "Food Quality", "Hygiene", "Service Quality", 
                               "Pricing", "Order Accuracy", "Bad Atmosphere", "Menu"]
    
    @patch('torch.cuda.is_available')
    @patch('transformers.BertForSequenceClassification.from_pretrained')
    @patch('transformers.AutoTokenizer.from_pretrained')
    def test_bert_prediction(self, mock_tokenizer_load, mock_model_load, mock_cuda):
        """Test BERT prediction for problem type"""
        mock_cuda.return_value = False
        
        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.return_value = {
            'input_ids': torch.tensor([[101, 1234, 567]]),
            'token_type_ids': torch.tensor([[0, 0, 0]]),
            'attention_mask': torch.tensor([[1, 1, 1]])
        }
        mock_tokenizer_load.return_value = mock_tokenizer
        
        # Mock model
        mock_model = MagicMock()
        logits = torch.tensor([[0.1, 1.5, 0.2, 0.3, 0.4, 0.5, 0.2, 0.1]])
        mock_output = MagicMock()
        mock_output.logits = logits
        mock_model.return_value = mock_output
        mock_model_load.return_value = mock_model
        
        from bert_pred import pred_b
        
        # Test prediction
        prediction = pred_b(self.test_text)
        
        # Assertions
        self.assertIn(prediction, self.expected_labels)
    
    @patch('torch.cuda.is_available')
    @patch('transformers.BertForSequenceClassification.from_pretrained')
    @patch('transformers.AutoTokenizer.from_pretrained')
    def test_bert_probabilities(self, mock_tokenizer_load, mock_model_load, mock_cuda):
        """Test BERT probability predictions"""
        mock_cuda.return_value = False
        
        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.return_value = {
            'input_ids': torch.tensor([[101, 1234, 567]]),
            'token_type_ids': torch.tensor([[0, 0, 0]]),
            'attention_mask': torch.tensor([[1, 1, 1]])
        }
        mock_tokenizer_load.return_value = mock_tokenizer
        
        # Mock model
        mock_model = MagicMock()
        logits = torch.tensor([[0.1, 1.5, 0.2, 0.3, 0.4, 0.5, 0.2, 0.1]])
        mock_output = MagicMock()
        mock_output.logits = logits
        mock_model.return_value = mock_output
        mock_model_load.return_value = mock_model
        
        from bert_pred import pred_b
        
        # Test probabilities
        probs = pred_b(self.test_text, prob=True)
        
        # Assertions
        self.assertIsInstance(probs, np.ndarray)
        self.assertEqual(probs.shape, (1, 8))
        self.assertAlmostEqual(np.sum(probs[0]), 1.0, places=5)


class TestRoBERTaPrediction(unittest.TestCase):
    """Test RoBERTa model for problem type classification"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.test_text = "Service quality was poor"
        self.expected_labels = ["Delivery Issue", "Food Quality", "Hygiene", "Service Quality", 
                               "Pricing", "Order Accuracy", "Bad Atmosphere", "Menu"]
    
    @patch('torch.cuda.is_available')
    @patch('transformers.RobertaForSequenceClassification.from_pretrained')
    @patch('transformers.AutoTokenizer.from_pretrained')
    def test_roberta_prediction(self, mock_tokenizer_load, mock_model_load, mock_cuda):
        """Test RoBERTa prediction for problem type"""
        mock_cuda.return_value = False
        
        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.return_value = {
            'input_ids': torch.tensor([[0, 1234, 567]]),
            'token_type_ids': torch.tensor([[0, 0, 0]]),
            'attention_mask': torch.tensor([[1, 1, 1]])
        }
        mock_tokenizer_load.return_value = mock_tokenizer
        
        # Mock model
        mock_model = MagicMock()
        logits = torch.tensor([[0.1, 0.2, 0.3, 1.5, 0.4, 0.5, 0.2, 0.1]])
        mock_output = MagicMock()
        mock_output.logits = logits
        mock_model.return_value = mock_output
        mock_model_load.return_value = mock_model
        
        from roberta_pred import pred_r
        
        # Test prediction
        prediction = pred_r(self.test_text)
        
        # Assertions
        self.assertIn(prediction, self.expected_labels)


class TestMLDLPredictions(unittest.TestCase):
    """Test ML and DL model predictions (SVC, RandomForest, LR, XGB, GRU, BiLSTM)"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.embedded_text_ml = np.random.rand(1, 100)  # ML embedding (FastText)
        self.embedded_text_dl = np.random.rand(1, 65)   # DL embedding (padded sequence)
    
    @patch('pickle.load')
    def test_ml_prediction_problem_type(self, mock_pickle):
        """Test ML model prediction for problem type"""
        # Mock ML model
        mock_model = MagicMock()
        mock_model.predict.return_value = [0]  # Delivery Issue
        mock_pickle.return_value = mock_model
        
        from ML_DL_pred import predict
        
        # Test prediction
        prediction = predict(
            model_location="dummy_path",
            embedded_text=self.embedded_text_ml,
            type="P",
            for_ML=True,
            prob=False
        )
        
        # Assertions
        self.assertEqual(prediction, "Delivery Issue")
        mock_model.predict.assert_called_once()
    
    @patch('pickle.load')
    def test_ml_prediction_probabilities(self, mock_pickle):
        """Test ML model probability predictions"""
        # Mock ML model
        mock_model = MagicMock()
        mock_probs = np.array([[0.1, 0.2, 0.3, 0.15, 0.1, 0.05, 0.05, 0.05]])
        mock_model.predict_proba.return_value = mock_probs
        mock_pickle.return_value = mock_model
        
        from ML_DL_pred import predict
        
        # Test probabilities
        probs = predict(
            model_location="dummy_path",
            embedded_text=self.embedded_text_ml,
            type="P",
            for_ML=True,
            prob=True
        )
        
        # Assertions
        self.assertIsInstance(probs, np.ndarray)
        self.assertEqual(probs.shape, (1, 8))
        self.assertAlmostEqual(np.sum(probs[0]), 1.0, places=5)
    
    @patch('tensorflow.keras.models.load_model')
    def test_dl_prediction_sentiment(self, mock_model_load):
        """Test DL model (GRU/BiLSTM) prediction for sentiment"""
        # Mock DL model
        mock_model = MagicMock()
        mock_probs = np.array([[0.1, 0.2, 0.7]])  # [Negative, Neutral, Positive]
        mock_model.predict.return_value = mock_probs
        mock_model_load.return_value = mock_model
        
        from ML_DL_pred import predict
        
        # Test prediction
        prediction = predict(
            model_location="dummy_path",
            embedded_text=self.embedded_text_dl,
            type="S",
            for_ML=False,
            prob=False
        )
        
        # Assertions
        self.assertEqual(prediction, "Positive")
    
    @patch('tensorflow.keras.models.load_model')
    def test_dl_prediction_emotion(self, mock_model_load):
        """Test DL model prediction for emotion"""
        # Mock DL model
        mock_model = MagicMock()
        mock_probs = np.array([[0.1, 0.75, 0.1, 0.05]])  # [Frustrated, Satisfied, Disgusted, Neutral]
        mock_model.predict.return_value = mock_probs
        mock_model_load.return_value = mock_model
        
        from ML_DL_pred import predict
        
        # Test prediction
        prediction = predict(
            model_location="dummy_path",
            embedded_text=self.embedded_text_dl,
            type="E",
            for_ML=False,
            prob=False
        )
        
        # Assertions
        self.assertEqual(prediction, "Satisfied")


class TestEnsembleVoting(unittest.TestCase):
    """Test ensemble voting mechanism (combines multiple models)"""
    
    def setUp(self):
        """Setup test fixtures"""
        self.test_text = "The food was cold and bad quality"
    
    @patch('fasttext_represent.embedd')
    @patch('ML_DL_pred.predict')
    @patch('bert_pred.pred_b')
    @patch('roberta_pred.pred_r')
    def test_ensemble_hard_voting_3_models(self, mock_roberta, mock_bert, mock_ml_dl, mock_embedd):
        """Test hard voting with 3 models"""
        # Mock embeddings
        mock_embedd.side_effect = [
            np.random.rand(1, 100),  # ML embedding
            np.random.rand(1, 65)    # DL embedding
        ]
        
        # Mock predictions
        mock_ml_dl.side_effect = [
            "Food Quality",  # ML model
            "Food Quality"   # DL model
        ]
        mock_bert.return_value = "Food Quality"
        mock_roberta.return_value = "Delivery Issue"
        
        from ensample_voting import vote
        
        # Test hard voting
        result = vote(
            text=self.test_text,
            weights=[1, 1, 1],
            models=["model1.pkl", "model2.h5"],
            soft=False,
            num_models=3,
            clf_type="P"
        )
        
        # Assertions - should be most common prediction
        self.assertIn(result, ["Food Quality", "Delivery Issue"])
    
    @patch('fasttext_represent.embedd')
    @patch('ML_DL_pred.predict')
    @patch('bert_pred.pred_b')
    @patch('roberta_pred.pred_r')
    def test_ensemble_soft_voting_3_models(self, mock_roberta, mock_bert, mock_ml_dl, mock_embedd):
        """Test soft weighted voting with 3 models"""
        # Mock embeddings
        mock_embedd.side_effect = [
            np.random.rand(1, 100),  # ML embedding
            np.random.rand(1, 65)    # DL embedding
        ]
        
        # Mock probabilities
        ml_probs = np.array([[0.1, 0.7, 0.05, 0.05, 0.05, 0.01, 0.01, 0.03]])
        dl_probs = np.array([[0.2, 0.6, 0.1, 0.05, 0.02, 0.01, 0.01, 0.01]])
        roberta_probs = np.array([[0.15, 0.65, 0.08, 0.05, 0.03, 0.01, 0.01, 0.02]])
        
        mock_ml_dl.side_effect = [ml_probs, dl_probs]
        mock_roberta.return_value = roberta_probs
        
        from ensample_voting import vote
        
        # Test soft voting
        result = vote(
            text=self.test_text,
            weights=[1.0, 1.0, 1.0],
            models=["model1.pkl", "model2.h5"],
            soft=True,
            num_models=3,
            clf_type="P"
        )
        
        # Assertions
        self.assertIsInstance(result, str)
        self.assertIn(result, ["Delivery Issue", "Food Quality", "Hygiene", "Service Quality", 
                              "Pricing", "Order Accuracy", "Bad Atmosphere", "Menu"])


class TestEnglishPriorityScorig(unittest.TestCase):
    """Test English priority scoring engine"""
    
    def test_priority_critical(self):
        """Test critical priority assignment"""
        from priority_scoring_ENG import score
        
        # Critical issue: Hygiene + Negative sentiment + Frustrated emotion
        result = score(
            problem_type="Hygiene",
            emotion="Frustrated",
            sentiment="Negative"
        )
        
        self.assertEqual(result, "Critical")
    
    def test_priority_high(self):
        """Test high priority assignment"""
        from priority_scoring_ENG import score
        
        # High issue: Food Quality + Negative sentiment
        result = score(
            problem_type="Food Quality",
            emotion="Neutral",
            sentiment="Negative"
        )
        
        self.assertEqual(result, "High")
    
    def test_priority_medium(self):
        """Test medium priority assignment"""
        from priority_scoring_ENG import score
        
        # Medium issue: Service Quality + Neutral sentiment
        result = score(
            problem_type="Service Quality",
            emotion="Neutral",
            sentiment="Neutral"
        )
        
        self.assertEqual(result, "Medium")
    
    def test_priority_low(self):
        """Test low priority assignment"""
        from priority_scoring_ENG import score
        
        # Low issue: Menu + Positive sentiment
        result = score(
            problem_type="Menu",
            emotion="Satisfied",
            sentiment="Positive"
        )
        
        self.assertEqual(result, "Low")


class TestArabicPriorityScoring(unittest.TestCase):
    """Test Arabic priority scoring engine"""
    
    def test_priority_critical_ar(self):
        """Test critical priority assignment (Arabic)"""
        from priority_scoring_AR import score
        
        # Critical issue: Hygiene + Negative sentiment + Disgusted emotion
        result = score(
            problem_type="Hygiene",
            emotion="Disgusted",
            sentiment="Negative"
        )
        
        self.assertEqual(result, "Critical")
    
    def test_priority_high_ar(self):
        """Test high priority assignment (Arabic)"""
        from priority_scoring_AR import score
        
        # High issue: Food Quality + Negative sentiment
        result = score(
            problem_type="Food Quality",
            emotion="Neutral",
            sentiment="Negative"
        )
        
        self.assertEqual(result, "High")
    
    def test_priority_medium_ar(self):
        """Test medium priority assignment (Arabic)"""
        from priority_scoring_AR import score
        
        # Medium issue: Delivery Issue
        result = score(
            problem_type="Delivery Issue",
            emotion="Neutral",
            sentiment="Neutral"
        )
        
        self.assertEqual(result, "Medium")
    
    def test_priority_low_ar(self):
        """Test low priority assignment (Arabic)"""
        from priority_scoring_AR import score
        
        # Low issue: Pricing + Positive
        result = score(
            problem_type="Pricing",
            emotion="Satisfied",
            sentiment="Positive"
        )
        
        self.assertEqual(result, "Low")


class TestModelIntegration(unittest.TestCase):
    """Integration tests for the complete pipeline"""
    
    def test_pipeline_flow(self):
        """Test complete prediction pipeline flow"""
        # Test that all components can work together
        self.assertTrue(True)  # Placeholder for full integration test
    
    def test_error_handling_invalid_input(self):
        """Test error handling for invalid inputs"""
        from ML_DL_pred import predict
        
        # Test with invalid classification type
        with self.assertRaises(ValueError):
            predict(
                model_location="dummy",
                embedded_text=np.random.rand(1, 100),
                type="INVALID",
                for_ML=True
            )


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
