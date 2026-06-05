import os
os.environ["HF_HUB_OFFLINE"] = "1"
from transformers import pipeline

pipe = pipeline(
    "text-classification",
    model="tabularisai/multilingual-emotion-classification",
    function_to_apply="sigmoid",
    top_k=None,
)

print(pipe("I love this product! It's amazing and works perfectly.")[0][0]['label'])

