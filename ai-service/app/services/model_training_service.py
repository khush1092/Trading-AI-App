from sklearn.metrics import accuracy_score

from app.core.config import get_settings
from app.models.baseline_model import TrainedBaselineModel, build_baseline_pipeline
from app.services.feature_engineering_service import PreparedDataset


def train_baseline_model(dataset: PreparedDataset) -> TrainedBaselineModel:
    settings = get_settings()
    labeled_frame = dataset.labeled_frame.copy()

    # ✅ Check minimum rows
    if len(labeled_frame) < settings.model_min_rows:
        raise ValueError(
            f"Not enough labeled rows to train the model. Need at least {settings.model_min_rows} rows."
        )

    # ✅ Extract target
    target = labeled_frame["target"]

    if target.nunique() < 2:
        raise ValueError("Target variation is insufficient to train the baseline classifier.")

    # ✅ Extract features
    feature_frame = labeled_frame[dataset.feature_columns].copy()

    # 🔥 CRITICAL FIX — remove NaN rows safely
    combined = feature_frame.copy()
    combined["target"] = target

    combined = combined.dropna()

    # split back
    feature_frame = combined[dataset.feature_columns]
    target = combined["target"]

    # ✅ Safety check after cleaning
    if len(feature_frame) < 30:
        raise ValueError("Not enough clean data after removing NaNs")

    # ✅ Train/test split
    split_index = max(int(len(feature_frame) * (1 - settings.model_test_size)), 1)

    if split_index >= len(feature_frame):
        split_index = len(feature_frame) - 1

    if split_index < 1 or len(feature_frame) - split_index < 1:
        raise ValueError("Unable to create a valid train/test split from the available data.")

    x_train = feature_frame.iloc[:split_index]
    y_train = target.iloc[:split_index]
    x_test = feature_frame.iloc[split_index:]
    y_test = target.iloc[split_index:]

    if y_train.nunique() < 2:
        raise ValueError("Training split does not contain enough class variation.")

    # ✅ Train evaluation model
    evaluation_pipeline = build_baseline_pipeline(settings.model_random_state)
    evaluation_pipeline.fit(x_train, y_train)

    y_pred = evaluation_pipeline.predict(x_test)
    accuracy = float(accuracy_score(y_test, y_pred))

    # ✅ Train final model
    final_pipeline = build_baseline_pipeline(settings.model_random_state)
    final_pipeline.fit(feature_frame, target)

    return TrainedBaselineModel(
        pipeline=final_pipeline,
        accuracy=accuracy,
        training_samples=len(x_train),
        test_samples=len(x_test),
        feature_columns=dataset.feature_columns
    )