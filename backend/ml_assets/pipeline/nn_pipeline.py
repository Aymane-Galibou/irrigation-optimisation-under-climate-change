import os
import shutil

import joblib
import mlflow.pyfunc
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from torch.utils.data import DataLoader, TensorDataset


# MLflow wrapper for preprocessing + PyTorch model
class SklearnPyTorchRegressor(mlflow.pyfunc.PythonModel):
    def load_context(self, context):
        """This runs automatically when mlflow.pyfunc.load_model is called"""
        # Load the preprocessor securely
        self.preprocessor = joblib.load(context.artifacts["preprocessor"])

        # Reconstruct the PyTorch architecture dynamically
        dummy_df = pd.DataFrame(
            [
                {
                    "feature_crop": "Maize",
                    "feature_soil": "Clay",
                    "feature_year": 2026,
                    "DAP": 1,
                    "DOY": 1,
                    "tmin": 15.0,
                    "tmax": 25.0,
                    "srad": 10.0,
                    "rain": 0.0,
                    "prev_day_deficit_mm": 0.0,
                }
            ]
        )
        input_dim = self.preprocessor.transform(dummy_df).shape[1]

        self.model = SoilWaterSurrogateNN(input_dim=input_dim)
        self.model.load_state_dict(
            torch.load(context.artifacts["pytorch_weights"], map_location="cpu")
        )
        self.model.eval()

    def predict(self, context, model_input):
        """This runs when you call .predict() on the loaded MLflow model"""
        # transforming features using sklearn processor
        features_encoded = self.preprocessor.transform(model_input).astype(np.float32)
        features_tensor = torch.tensor(features_encoded, dtype=torch.float32)

        # running pytorch prediction safely
        with torch.no_grad():
            raw_predictions = self.model(features_tensor).numpy().flatten()

        final_predictions = np.clip(raw_predictions, a_min=0.0, a_max=None)
        return final_predictions


# Neural Network MLP
class SoilWaterSurrogateNN(nn.Module):
    def __init__(self, input_dim):
        super(SoilWaterSurrogateNN, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.LeakyReLU(0.1),
            nn.Dropout(0.1),
            nn.Linear(64, 32),
            nn.LeakyReLU(0.1),
            nn.Linear(32, 16),
            nn.LeakyReLU(0.1),
            nn.Linear(16, 1),
            nn.Softplus(),
        )

    def forward(self, x):
        return self.network(x)


def train_evaluate_save_nn(ml_ready_dataset: pd.DataFrame, epochs=100, batch_size=32):
    # Copying data
    df_clean = ml_ready_dataset.dropna().copy()

    # Defining feature columns
    categorical_features = ["feature_crop", "feature_soil"]
    numerical_features = [
        "feature_year",
        "DAP",
        "DOY",
        "tmin",
        "tmax",
        "srad",
        "rain",
        "prev_day_deficit_mm",
    ]
    feature_columns = categorical_features + numerical_features

    X = df_clean[feature_columns]
    Y = df_clean[["SWTD_deficit_mm"]].values.astype(np.float32)

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", drop="first"),
                categorical_features,
            ),
            ("num", StandardScaler(), numerical_features),
        ]
    )

    # Splitting data into train & test data
    X_train, X_test, y_train, y_test = train_test_split(
        X, Y, test_size=0.2, random_state=42
    )

    X_train_encoded = preprocessor.fit_transform(X_train).astype(np.float32)
    X_test_encoded = preprocessor.transform(X_test).astype(np.float32)

    # Converting data arrays to Pytorch Tensors
    X_train_tensor = torch.tensor(X_train_encoded)
    y_train_tensor = torch.tensor(y_train)
    X_test_tensor = torch.tensor(X_test_encoded)
    y_test_tensor = torch.tensor(y_test)

    # Wrap up in PyTorch dataloaders
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # Initialize model, loss & optimizer
    input_dim = X_train_encoded.shape[1]
    model = SoilWaterSurrogateNN(input_dim)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-5)

    # Training loop
    model.train()
    print(
        f"Training deep network on {X_train_encoded.shape[0]} rows across {epochs} epochs..."
    )
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            predictions = model(batch_x)
            loss = criterion(predictions, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * batch_x.size(0)

        if (epoch + 1) % 10 == 0 or epoch == 0:
            print(
                f" -> Epoch {epoch + 1}/{epochs} | Avg Loss: {epoch_loss / len(train_dataset):.4f}"
            )

    # evaluating the model
    model.eval()
    with torch.no_grad():
        y_pred_tensor = model(X_test_tensor)
        y_pred = y_pred_tensor.numpy().flatten()

    y_test_flat = y_test.flatten()

    # Calculate standard validation metrics
    mae = mean_absolute_error(y_test_flat, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_flat, y_pred))
    r2 = r2_score(y_test_flat, y_pred)

    print("\n================ DEEP LEARNING PERFORMANCE ================")
    print("Target Variable: SWTD_deficit_mm")
    print(f" -> Mean Absolute Error     : {mae:.4f} mm")
    print(f" -> Root Mean Squared Error  : {rmse:.4f} mm")
    print(f" -> R2 Score                : {r2:.4f}")

    # Save components temporarily to package them
    os.makedirs("/tmp/model_parts", exist_ok=True)
    joblib.dump(preprocessor, "/tmp/model_parts/preprocessor.joblib")
    torch.save(model.state_dict(), "/tmp/model_parts/nn_model_weights.pth")

    # Define the artifacts dictionary for MLflow
    artifacts = {
        "preprocessor": "/tmp/model_parts/preprocessor.joblib",
        "pytorch_weights": "/tmp/model_parts/nn_model_weights.pth",
    }

    # Save the custom model to MLflow
    pipeline_path = "./backend/ml_assets/models/nn_mlp_model"

    # preventing overwrite crash
    if os.path.exists(pipeline_path):
        print(f"Cleaning up existing model folder at {pipeline_path}...")
        shutil.rmtree(pipeline_path)

    mlflow.pyfunc.save_model(
        path=pipeline_path,
        python_model=SklearnPyTorchRegressor(),
        artifacts=artifacts,
        # This tells MLflow exactly what packages this model needs
        pip_requirements=["torch", "scikit-learn", "pandas", "numpy", "joblib"],
    )
    print(f"✅ Successfully saved custom PyFunc model to MLflow at {pipeline_path}!")


if __name__ == "__main__":
    final_dataset = pd.read_csv("./backend/ml_assets/data/xdata.csv")
    train_evaluate_save_nn(final_dataset, epochs=100)
