import pickle
from tensorflow import keras
import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import fasttext

logger = logging.getLogger(__name__)


class ModelLoad:
    def __init__(self):
        self._cache = {}  # Persistent cache across calls

    def load_pickle(self, model_path: str):
        if model_path in self._cache:
            return self._cache[model_path]

        try:
            model = pickle.load(open(model_path, "rb"))
            self._cache[model_path] = model
            logger.info(f"Loaded pickle model successfully: {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load pickle model {model_path}: {str(e)}")
            return None

    def load_keras_model(self, model_path: str):
        if model_path in self._cache:
            return self._cache[model_path]

        try:
            model = keras.models.load_model(model_path)
            self._cache[model_path] = model
            logger.info(f"Loaded Keras model successfully: {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load Keras model {model_path}: {str(e)}")
            return None

    def load_transformer(self, model_path: str):
        if model_path in self._cache:
            return self._cache[model_path]

        try:
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            model = AutoModelForSequenceClassification.from_pretrained(model_path)
            cached_tuple = (tokenizer, model)
            self._cache[model_path] = cached_tuple
            logger.info(f"Loaded Transformer model successfully: {model_path}")
            return cached_tuple
        except Exception as e:
            logger.error(f"Failed to load transformer model {model_path}: {str(e)}")
            return None, None

    def load_fasttext_model(self, model_path: str):
        if model_path in self._cache:
            return self._cache[model_path]

        try:
            model = fasttext.load_model(model_path)
            self._cache[model_path] = model
            logger.info(f"Loaded FastText model successfully: {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load FastText model {model_path}: {str(e)}", exc_info=True)
            return None