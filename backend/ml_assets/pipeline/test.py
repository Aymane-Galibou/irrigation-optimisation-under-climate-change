import pandas as pd
import mlflow.sklearn as mlsk

def run_realtime_prediction():
    # Path to your saved model directory
    pipeline_path = './ia-traitement/ml_assets/models/nn_mlp_model'
    
    print("Loading the production pipeline...")
    # MLflow automatically resolves the cloudpickle format and loads both 
    production_pipeline = mlsk.load_model(model_uri=pipeline_path)
    
    raw_incoming_data = pd.DataFrame([{
        'feature_crop': 'Maize',
        'feature_soil': 'Brun_Calcaire_Silt_Loam',
        'feature_year': 2026,
        'DAP': 45,                  # Days After Planting
        'DOY': 172,                 # Day Of Year
        'tmin': 16.5,
        'tmax': 31.2,
        'srad': 24.8,
        'rain': 0.0,
        'prev_day_deficit_mm': 12.4
    }])
    
    print("\nExecuting unified pipeline inference...")
    # The pipeline automatically executes
    prediction = production_pipeline.predict(raw_incoming_data)
    
    print("\n================ LIVE INFERENCE RESULT ================")
    print(f" -> Input Crop             : {raw_incoming_data['feature_crop'].values[0]}")
    print(f" -> Input Soil             : {raw_incoming_data['feature_soil'].values[0]}")
    print(f" -> Predicted SWTD Deficit : {prediction[0]:.4f} mm")

if __name__ == "__main__":
    run_realtime_prediction()