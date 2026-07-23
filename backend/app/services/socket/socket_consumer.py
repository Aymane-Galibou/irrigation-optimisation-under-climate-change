import os
import json
from datetime import datetime
import asyncio
import pandas as pd
import mlflow.sklearn as mlsk
from confluent_kafka import Consumer, KafkaException, KafkaError, OFFSET_END
import mlflow.pyfunc as mlpy


async def ml_analytics(data_dict: dict, sio, xgboost_model,app):
    try:
        raw_time_data = pd.DataFrame([data_dict])
        xgb_pred = await asyncio.to_thread(xgboost_model.predict, raw_time_data)
        
        xgb_val = xgb_pred.tolist() if hasattr(xgb_pred, "tolist") else xgb_pred

        xgb_pred = xgb_val[0] if isinstance(xgb_val, list) else xgb_val


        deficit_mm = round(float(xgb_pred), 2)

        app.state.prev_deficit_mm = deficit_mm

        if deficit_mm < 5.0:
            status_level = "success"  # Green UI theme
            title = "Optimal Moisture"
            message = (f"Soil water levels are optimal ({deficit_mm} mm deficit). No action needed.")
            action_required = False
            recommended_water_mm = 0.0

        elif 5.0 <= deficit_mm < 15.0:
            status_level = "info"  # Blue UI theme
            title = "Normal Condition"
            message = f"Minor moisture deficit ({deficit_mm} mm). Irrigation is optional."
            action_required = False
            recommended_water_mm = 0.0

        elif 15.0 <= deficit_mm < 30.0:
            status_level = "warning"  # Amber/Orange UI theme
            title = "Moderate Water Stress"
            message = f"Moisture deficit has reached {deficit_mm} mm. Plan an irrigation cycle soon."
            action_required = True
            recommended_water_mm = deficit_mm

        else:  
            status_level = "danger"  # Red UI theme
            title = "Critical Deficit"
            message = f"Critical threshold exceeded ({deficit_mm} mm)! Immediate irrigation required to prevent crop yield loss."
            action_required = True
            recommended_water_mm = deficit_mm

        
        payload = {
            "weather": data_dict,
            "time": datetime.now().isoformat(),
            "predicted_deficit_mm": deficit_mm,
            "status_level": status_level, 
            "title": title,
            "message": message,
            "action_required": action_required,
            "recommended_water_mm": recommended_water_mm,
        }

        # Emit the payload safely on the active event loop
        await sio.emit("weather-emit", {"data": payload})
        print("📡 Emitted prediction data successfully!")

    except Exception as e:
        print(f"❌ Something went wrong during prediction: {e}")


async def socket_consumer_loop(sio,app):
    consumer_config = {
    # Confluent Cloud Broker & SSL
    "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": os.getenv("KAFKA_SASL_MECHANISM", "PLAIN"),
    "sasl.username": os.getenv("KAFKA_SASL_USERNAME"),
    "sasl.password": os.getenv("KAFKA_SASL_PASSWORD"),
    
    # Consumer Group settings
    "group.id": "socket_group",  
    "auto.offset.reset": "latest",  
    "enable.auto.commit": False,
    'ssl.ca.location': '/etc/ssl/certs/ca-certificates.crt',
    }

    TOPIC = os.getenv("KAFKA_TOPIC")

    consumer = Consumer(consumer_config)

    def on_assign(consumer, partitions):
        for p in partitions:
            p.offset = OFFSET_END
        consumer.assign(partitions)
        print(
            "[Socket Consumer] Partitions assigned, seeked to end — ready for live data ✅"
        )

    consumer.subscribe([TOPIC], on_assign=on_assign)

    print(
        f"[Socket Consumer] Subscribed to {TOPIC}, waiting for partition assignment... 👂"
    )

    # loading models
    xgb_model = None
    print("🧠 [Diagnostic] Starting Model Loading...")

    try:
        print("🔍 Loading XGBoost...")
        xgb_model = mlsk.load_model(model_uri="./ml_assets/models/xgboost_model")
        print("✅ XGBoost Loaded!")

    except Exception as e:
        print(f"❌ Failed to load models: {e}")
        consumer.close()
        return

    try:
        while True:
            msg = await asyncio.to_thread(consumer.poll, 1.0)
            if msg is None:
                continue

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    raise KafkaException(msg.error())

            data_dict = json.loads(msg.value().decode("utf-8"))

            await ml_analytics(data_dict, sio, xgb_model,app)

            consumer.commit(asynchronous=True)

    finally:
        consumer.close()
        print("Consumer closed successfuly 🛑")
