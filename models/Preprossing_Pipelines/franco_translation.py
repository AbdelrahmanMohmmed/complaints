# Related imports
import requests

def franco_to_arabic(text):
    """
    Docstring for franco_to_arabic function:
        Transforms the incoming franco text into arabic using an API from google.
    
    Params:
        text: the complaint or review

    Return Values: 
        The translated franco text into arabic
    """
    url = "https://inputtools.google.com/request"
    params = {
        "itc": "ar-t-i0-und",
        "num": 1,
        "cp": 0,
        "cs": 1,
        "ie": "utf-8",
        "oe": "utf-8",
        "app": "test"
    }
    payload = {"text": text}

    try:
        response = requests.post(url, params=params, data=payload)
        response.raise_for_status()
        data = response.json()
        if data[0] == "SUCCESS":
            return data[1][0][1][0]
        else:
            return "Error: Could not process"
    except Exception as e:
        return f"Request failed: {str(e)}"

