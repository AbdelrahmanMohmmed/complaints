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

def transform(df,col_name='comment',complaint=(food_clusters_ara,
                                               food_clusters_en)):
    
    df[col_name] = df[col_name].fillna("").astype(str).str.strip()

    # Drop empty rows
    df = df[df[col_name] != ""]

    # Drop rows that contain only numbers (e.g., "9", "10")
    df = df[~df[col_name].str.fullmatch(r'\d+')]

    english_df = df[df[col_name].apply(isEnglish)]
    arabic_df  = df[~df[col_name].apply(isEnglish)]
    arabic_df["complaint_cluster"] = arabic_df[col_name].apply(
        lambda x: ' '.join(classify_comment_ar(x, complaint[0]))
    )
    english_df["complaint_cluster"] = english_df[col_name].apply(
        lambda x: ' '.join(classify_comment_en(x, complaint[1]))
    )

    return english_df,arabic_df



def load(df,loc):
    df.to_csv(loc,index=False)