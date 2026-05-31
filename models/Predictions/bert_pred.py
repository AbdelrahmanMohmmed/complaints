# Related Imports
from transformers import BertForSequenceClassification, AutoTokenizer
import torch

# Label mapping
id2label = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene", 3: "Service Quality", 
            4: "Pricing", 5: "Order Accuracy", 6: "Bad Atmosphere", 7: "Menu"}

# If there is a GPU use it otherwise use a CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
# Load trained bert model
bert = BertForSequenceClassification.from_pretrained(r"F:\FMS\Preprocessing and Training\Models\Probelm-Type-Classification\bert_70").to(device)
# Load the trained tokenizer
tokenizer = AutoTokenizer.from_pretrained(r"F:\FMS\Preprocessing and Training\Models\Probelm-Type-Classification\bert_70")
bert.eval()

def pred_b(text : str, prob = False) -> str:
    """ 
    Docstring for pred_b function: 
        1. Load the pretrained bert model.
        2. Load the pretrained tokenizer.
        3. Tokenize the input text.
        4. Predict the output label.
        5. Map the label using a mapping dictionary

    Params:
        text: the incoming feedback or comment (str)
        prob: if you want to predict the probabilities of the classes (bool, default "False").

    Return Values:
        The predicted value or probabilities
    """
    # Tokenize the text
    inputs = tokenizer(
    text,
    padding="max_length",
    truncation=True,
    return_tensors="pt")
    
    # Move the tokens to the same device as the model
    inputs = {k:v.to(device) for k,v in inputs.items()}

    with torch.no_grad():
        # Unpack the dictonary into the model and predict
        outputs = bert(**inputs)
        # Get the logits (value between -1: 1)
        logits = outputs.logits
        if prob:
            # Get the probabilites of predicted classes
            probs = torch.softmax(logits, dim=-1)
            probs = probs.detach().cpu().numpy()
            return probs
        else:
            # Get the class id with highest value
            pred_id = torch.argmax(logits, dim=1).cpu().numpy()
            pred_id = int(pred_id)
            return id2label[pred_id]