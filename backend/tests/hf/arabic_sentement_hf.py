import os
os.environ["HF_HUB_OFFLINE"] = "1"
from camel_tools.sentiment import SentimentAnalyzer
sa = SentimentAnalyzer("CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment")
sentences = ['أنا بخير', 'أنا لست بخير']
print(sa.predict(sentences))
