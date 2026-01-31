from pipeline_utils import *
import os
import glob

# Directory location for data folder
DATA_LOCATION = '/home/jax/complaints/data/external'

def complain_pipeline(prefix,comment,complains_dict,eng_loc,ara_loc,extra=None):
    """
    Processes complaint data files, labels complaint clusters, 
    and saves English and Arabic dataframes.

    Steps performed:
    1. Collects all files in DATA_LOCATION starting with the given prefix.
       Optionally, extra file paths can be added.
    2. Extracts and concatenates all files into a single DataFrame.
    3. Splits the DataFrame into English and Arabic comments using language detection.
    4. Labels each comment with the corresponding complaint clusters 
    (based on complains_dict).
    5. Prints DataFrame shapes and first few rows at each major step 
    for debugging/inspection.
    6. Saves the resulting English and Arabic DataFrames to CSV files.

    Parameters:
    -----------
    prefix : str
        First characters of the file names to process in DATA_LOCATION.
    comment : str
        Name of the column containing the comments to analyze.
    complains_dict : tuple
        A tuple of two dictionaries: (Arabic_complaints_dict, English_complaints_dict)
        Used to label complaint clusters for each language.
    eng_loc : str
        Path to save the English DataFrame CSV.
    ara_loc : str
        Path to save the Arabic DataFrame CSV.
    extra : list, optional
        List of additional file paths to include in the concatenation (default is None).

    Notes:
    ------
    - The function prints the list of files being processed, the shape of the concatenated
      DataFrame, and the first few rows of each step to help with debugging.
    - Complaint clusters are added in a column called 'complaint_cluster' inside the transform function.
    - The function assumes the existence of the helper functions `extract()` and `transform()`.

    Example:
    --------
    complain_pipeline(
        prefix='all',
        comment='text',
        complains_dict=(Plumbing_clusters_ara, Plumbing_clusters_en),
        eng_loc='Plumbing_eng.csv',
        ara_loc='Plumbing_ara.csv'
    )
    """
    files = glob.glob(os.path.join(DATA_LOCATION, f"{prefix}*"))
    
    if extra != None:
       for f in extra:
        files.append(f) 
    
    print("Files to process:", files)
    
    # Extract and concatenate files into one DataFrame
    df = extract(files)
    print("Combined DataFrame shape:", df.shape)
    print("Sample of combined DataFrame:\n", df.head())
    
    # Transform DataFrame: split by language and label complaint clusters
    eng_df,ara_df = transform(df,col_name=comment,complaint=complains_dict)
    print("English DataFrame sample:\n", eng_df.head())
    print("Arabic DataFrame sample:\n", ara_df.head())
    print("English DataFrame shape:", eng_df.shape)
    print("Arabic DataFrame shape:", ara_df.shape)

    # Save the resulting DataFrames to CSV
    load(eng_df,eng_loc)
    load(ara_df,ara_loc)

complain_pipeline('all','text',(Plumbing_clusters_ara,
                                Plumbing_clusters_en),'Plumbing_eng.csv','Plumbing_ara.csv')