import os
os.environ["HF_HUB_OFFLINE"] = "1"
from transformers import pipeline

pipe = pipeline("text-classification", model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis")
print(pipe("I love this product.")['label'])