"""Small test runner for the HF loader.

Run locally to download/load a model and run a quick inference.

Example:
    python -m app.ai.test_hf_loader mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis
"""

import sys
import logging

from app.ai.hf_loader import get_text_classification_pipeline

logging.basicConfig(level=logging.INFO)


def main():
    if len(sys.argv) < 2:
        print("Usage: python -m app.ai.test_hf_loader <model-name>")
        sys.exit(1)
    model_name = sys.argv[1]
    pipe = get_text_classification_pipeline(model_name)
    print(pipe("I like you. I love you"))


if __name__ == "__main__":
    main()
