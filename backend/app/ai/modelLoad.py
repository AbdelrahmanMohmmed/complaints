import pickle
from tensorflow import keras
import logging

class  ModelLoad:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def load_pickle(self,model_path):
        try:
            model = pickle.load(open(model_path, "rb"))
            self.logger.info(f"Loaded model Successfully from {model_path}")
            return model
        except Exception as e:
            self.logger.error(f"Failed to load model from {model_path} : {str(e)}")
    
    def load_keras_model(self,model_path):
        try:
            model = keras.models.load_model(model_path)
            self.logger.info(f"Loaded model Successfully from {model_path}")
            return model
        except Exception as e:
            self.logger.error(f"Failed to load model from {model_path} : {str(e)}")
