from dataclasses import dataclass

from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline


MODEL_NAME = "RandomForestClassifier"


@dataclass(frozen=True)
class TrainedBaselineModel:
    pipeline: Pipeline
    accuracy: float
    training_samples: int
    test_samples: int
    feature_columns: list[str]


def build_baseline_pipeline(random_state: int) -> Pipeline:
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=8,
                    min_samples_leaf=3,
                    class_weight="balanced_subsample",
                    random_state=random_state
                )
            )
        ]
    )
