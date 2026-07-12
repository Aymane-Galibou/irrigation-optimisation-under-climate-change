import torch 
import torch.nn as nn 
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
import mlflow.sklearn as mlsk
from sklearn.base import BaseEstimator, RegressorMixin

# sklearn wrapper for pytorch 
class SklearnPyTorchRegressor(BaseEstimator, RegressorMixin):
    def __init__(self, pytorch_model):
        self.pytorch_model = pytorch_model
        
    def fit(self, X, y=None):
        self.fitted_ = True
        return self
        
    def predict(self, X):
        self.pytorch_model.eval()
        if hasattr(X, "toarray"):
            X = X.toarray()
        X_tensor = torch.tensor(X, dtype=torch.float32)
        with torch.no_grad():
            predictions = self.pytorch_model(X_tensor).numpy()
        return predictions.flatten()

# Neural Network MLP
class SoilWaterSurrogateNN(nn.Module):
    def __init__(self, input_dim):
        super(SoilWaterSurrogateNN, self).__init__()
        # Deep architecture with leaky ReLU to prevent dying neurons
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.LeakyReLU(0.1),
            nn.Dropout(0.1),
            
            nn.Linear(64, 32),
            nn.LeakyReLU(0.1),
            
            nn.Linear(32, 16),
            nn.LeakyReLU(0.1),
            
            nn.Linear(16, 1) 
        )
        
    def forward(self, x):
        return self.network(x)
    
def train_evaluate_save_nn(ml_ready_dataset: pd.DataFrame, epochs=100, batch_size=32):
    
    # copying data
    df_clean = ml_ready_dataset.dropna().copy()

    # defining features columns 
    categorical_features = ['feature_crop', 'feature_soil']
    numerical_features = [
        'feature_year', 
        'DAP', 
        'DOY', 
        'tmin', 
        'tmax', 
        'srad', 
        'rain', 
        'prev_day_deficit_mm'
    ]
    feature_columns = categorical_features + numerical_features

    X = df_clean[feature_columns]
    Y = df_clean[['SWTD_deficit_mm']].values.astype(np.float32)

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', drop='first'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )

    # spliting data into train & test data
    X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

    X_train_encoded = preprocessor.fit_transform(X_train).astype(np.float32)
    X_test_encoded = preprocessor.transform(X_test).astype(np.float32)

    # converting data arrays to Pytorch Tensors
    X_train_tensor = torch.tensor(X_train_encoded)
    y_train_tensor = torch.tensor(y_train)
    X_test_tensor = torch.tensor(X_test_encoded)
    y_test_tensor = torch.tensor(y_test)

    # wrap up in pytorch dataloaders 
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # initialize model , loss & optimizer 
    input_dim = X_train_encoded.shape[1]
    model = SoilWaterSurrogateNN(input_dim)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-5)

    # training loop 
    model.train()
    print(f"Training deep network on {X_train_encoded.shape[0]} rows across {epochs} epochs...")
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
            print(f" -> Epoch {epoch+1}/{epochs} | Avg Loss: {epoch_loss / len(train_dataset):.4f}")

    # we wrappe the deep learning model within a sklear wrapper
    sklearn_compatible_nn = SklearnPyTorchRegressor(pytorch_model=model)

    # create a production pipeline 
    production_pipeline = Pipeline(
        steps=[
            ('preprocessor', preprocessor),
            ('nn_regressor', sklearn_compatible_nn) 
        ]
    )

    # fitting the model 
    production_pipeline.fit(X_train, y_train)

    # model evaluating 
    y_pred = production_pipeline.predict(X_test)
    
    y_test_flat = y_test.flatten()

    # Calculate standard validation metrics
    mae = mean_absolute_error(y_test_flat, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_flat, y_pred))
    r2 = r2_score(y_test_flat, y_pred)

    print("\n================ DEEP LEARNING PERFORMANCE ================")
    print("Target Variable: SWTD_deficit_mm")
    print(f" -> Mean Absolute Error     : {mae:.4f} mm")
    print(f" -> Root Mean Squared Error  : {rmse:.4f} mm")
    print(f" -> R2 Score   : {r2:.4f}")

    pipeline_path = './ia-traitement/ml_assets/models/nn_mlp_model'
    mlsk.save_model(
        sk_model=production_pipeline,
        path=pipeline_path,
        serialization_format="cloudpickle"
    )

if __name__ == "__main__":
    final_dataset = pd.read_csv('./ia-traitement/ml_assets/data/xdata.csv')
    train_evaluate_save_nn(final_dataset, epochs=100)