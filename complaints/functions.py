import string

def loadDictionary(location):
    dictionaryFile = open(location)
    englishWords = {}
    for word in dictionaryFile.read().split('\n'):
        englishWords[word] = None
    dictionaryFile.close()
    return englishWords


ENGLISH_WORDS = loadDictionary('/home/jax/complaints/complaints/dictionary.txt')
LETTERS_AND_SPACE = string.ascii_letters + ' '

def removeNonLetters(message):
    lettersOnly = []
    for symbol in message:
        if symbol in LETTERS_AND_SPACE:
            lettersOnly.append(symbol)
    return ''.join(lettersOnly)

def getEnglishCount(message):
    message = str(message)
    message = message.upper()
    message = removeNonLetters(message)
    possibleWords = message.split()
    if possibleWords == []:
        return 0.0 # No words at all, so return 0.0
    matches = 0
    for word in possibleWords:
        if word in ENGLISH_WORDS:
            matches += 1
    return float(matches) / len(possibleWords)

def isEnglish(message, wordPercentage=20, letterPercentage=85):
    # By default, 20% of the words must exist in the dictionary file, and
    # 85% of all the characters in the message must be letters or spaces
    # (not punctuation or numbers).
    wordsMatch = getEnglishCount(message) * 100 >= wordPercentage
    numLetters = len(removeNonLetters(message))
    messageLettersPercentage = float(numLetters) / len(message) * 100
    lettersMatch = messageLettersPercentage >= letterPercentage
    return wordsMatch and lettersMatch

def classify_comment_ar(comment, clusters):
    found_clusters = []
    for cluster, keywords in clusters.items():
        for word in keywords:
            if word in comment:
                found_clusters.append(cluster)
                break
    return found_clusters

def classify_comment_en(comment, clusters):
    found_clusters = []
    for cluster, keywords in clusters.items():
        for word in keywords:
            if word.lower() in comment.lower():
                found_clusters.append(cluster)
                break
    return found_clusters
