from fastapi import APIRouter,Request,HTTPException
import json
import pandas as pd 
import mlflow.sklearn as mlsk 

router = APIRouter(prefix="/simulations",tags=["simulations"])

try:
    XGBOOST_MODEL = mlsk.load_model("./ml_assets/models/xgboost_model")
    print("XGBoost model loaded successfully globally.")
except Exception as e:
    print(f"CRITICAL: Failed to load XGBoost model on startup: {e}")
    XGBOOST_MODEL = None


@router.post("/manual")
async def simulate_manual(request:Request):

    if XGBOOST_MODEL is None:
        raise HTTPException(status_code=500, detail="ML Model is not available on the server.")

    try:
        body_bytes = await request.body()
        data = json.loads(body_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {e}")
    
    print(data)

    try:
        data_formatted = pd.DataFrame(data if isinstance(data, list) else [data])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to structuralize data into DataFrame: {e}")
    
    try:
        xgb_predicted = XGBOOST_MODEL.predict(data_formatted)
        xgb_val = xgb_predicted.tolist() if hasattr(xgb_predicted,"tolist") else xgb_predicted
    
    except Exception as e :
        print(f"Something Went Wrong while predicting {e}")

    
    return {
        "ok": True,
        "status": "success",
        "prediction": xgb_val
    }