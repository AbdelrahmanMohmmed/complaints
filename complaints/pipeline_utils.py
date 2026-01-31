import pandas as pd
from functions import *
from constants import * 
def extract(data_locs,use_first_col_index=True):
    main_df = pd.DataFrame()
    
    for data_loc in data_locs:
        if use_first_col_index:
            df = pd.read_csv(data_loc,index_col=0)
        else:
            df = pd.read_csv(data_loc)
        
        main_df = pd.concat((main_df,df),ignore_index=True)
    
    return main_df

def transform(df,col_name='comment'):
    english_df = df[df[col_name].apply(isEnglish)]
    arabic_df  = df[~df[col_name].apply(isEnglish)]
    arabic_df["complaint_cluster"] = arabic_df[col_name].apply(
        lambda x: ' '.join(classify_comment_ar(x, food_clusters_ara))
    )
    english_df["complaint_cluster"] = english_df[col_name].apply(
        lambda x: ' '.join(classify_comment_en(x, food_clusters_en))
    )

    return english_df,arabic_df

def load(df,loc):
    df.to_csv(loc,index=False)