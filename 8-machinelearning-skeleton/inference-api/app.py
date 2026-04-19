from pathlib import Path
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

MODEL_PATH = Path("model.joblib")


def create_default_model():
    model = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    # minimal training so predict works
    model.fit(["dummy"], [0])
    return model


def load_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)

    model = create_default_model()
    joblib.dump(model, MODEL_PATH)
    return model


model = load_model()