from pipeline_utils import *
import os

DATA_LOCATION = '/home/jax/complaints/data/external'

import glob
prefix = "elmenu"

files = glob.glob(os.path.join(DATA_LOCATION, f"{prefix}*"))

print(files)

df = extract(files)

print(df.shape)
print(df.head())
eng_df,ara_df = transform(df)
print(eng_df.head())
print(ara_df.head())
print(eng_df.shape)
print(ara_df.shape)

load(eng_df,'elmenu_eng.csv')
load(ara_df,'elmenu_ara.csv')

