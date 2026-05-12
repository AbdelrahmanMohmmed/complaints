from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_NAME = "aubmindlab/bert-base-arabertv2"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
bert_model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
bert_model.to(device)
bert_model.eval()


def embedd(text: str):
    """
    Docstring for embedd function: 
        Convert a single Arabic text review into an embedding vector
        ready for ML model prediction.
    
    Params:
        text (str): Arabic review text
        
    Return Values:
        np.array: Embedding vector of shape (768,)
    """

    inputs = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = bert_model.bert(**inputs)

    hidden_states = outputs.last_hidden_state

    # Mean pooling
    embedding = hidden_states.mean(dim=1)

    return embedding.cpu().numpy()