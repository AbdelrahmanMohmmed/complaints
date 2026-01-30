import pandas as pd

def load(data_loc):
    df = pd.read_csv(data_loc)
    return df

def transform(df,save_loc):
    pass