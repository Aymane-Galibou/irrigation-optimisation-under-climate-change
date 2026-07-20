import numpy as np
import pandas as pd 
from sklearn.preprocessing import OneHotEncoder,StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score
from sklearn.pipeline import Pipeline
import mlflow.sklearn as mlsk

def training_evaluating_saving_model(data:pd.DataFrame):

    # cleaning data (even we are sure it's clean)
    df_clean = data.dropna().copy()

    # defining feature columns 
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
    Y = df_clean["SWTD_deficit_mm"].values

    # preparing transformers (hot encoder + standard scaler to avoid high variance between features)
    preprocessor = ColumnTransformer(
        transformers=[
        ('cat',OneHotEncoder(handle_unknown='ignore', drop='first'),categorical_features),
        ('num',StandardScaler(),numerical_features)
        ],
        remainder='passthrough'
        )

    X_train,X_test,Y_train,Y_test = train_test_split(X,Y,test_size=0.2,random_state=42)

    # transforming columns 
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    # initializing the xgboost
    xgb_model = xgb.XGBRegressor(
        objective='reg:tweedie',
        tweedie_variance_power=1.5, # 1.5 is standard for zero-inflated physical metrics
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1        
    )

 
    # training the model
    xgb_model.fit(
        X_train_transformed,Y_train,
        eval_set=[(X_test_transformed,Y_test)],
        verbose=50
    )

    # creating the pipeline 
    production_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor), 
    ('regressor', xgb_model) 
    ])

    # evaluating the model 
    Y_predicted = production_pipeline.predict(X_test)

    # calculating the metrics 
    mae=mean_absolute_error(Y_test,Y_predicted)
    rmse=np.sqrt(mean_squared_error(Y_test,Y_predicted))
    r2=r2_score(Y_test,Y_predicted)

    print("\n================ XGBOOST PERFORMANCE ================")
    print("Target Variable:  SWTD_deficit_mm ")
    print(f" -> Mean Absolute Error (MAE)     : {mae:.4f} mm")
    print(f" -> Root Mean Squared Error : {rmse:.4f} mm")
    print(f" -> R2 Score  : {r2:.4f}")
    print("======================================================")

    pipeline_path = './backend/ml_assets/models/xgboost_model'
    mlsk.save_model(
        sk_model=production_pipeline,
        path=pipeline_path,
        skops_trusted_types=[
            'xgboost.core.Booster', 
            'xgboost.sklearn.XGBRegressor'
        ]
        )




# --- Point d'entrée du script ---
if __name__ == "__main__":
    final_dataset = pd.read_csv('./backend/ml_assets/data/xdata.csv')
    training_evaluating_saving_model(final_dataset)