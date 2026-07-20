import os
import json
from datetime import datetime
import asyncio
import pandas as pd
import mlflow.sklearn as mlsk
from confluent_kafka import Consumer, KafkaException, KafkaError, OFFSET_END
import mlflow.pyfunc as mlpy


async def ml_analytics(data_dict: dict, sio, xgboost_model, nn_mlp_model):
    try:
        raw_time_data = pd.DataFrame([data_dict])
        xgb_pred, nn_pred = await asyncio.gather(
            asyncio.to_thread(xgboost_model.predict, raw_time_data),
            asyncio.to_thread(nn_mlp_model.predict, raw_time_data)
            )

        xgb_val = xgb_pred.tolist() if hasattr(xgb_pred, "tolist") else xgb_pred
        nn_val = nn_pred.tolist() if hasattr(nn_pred, "tolist") else nn_pred

        payload = {
            "weather": data_dict,
            "time": datetime.now().isoformat(),
            "xgboostPrediction": xgb_val[0] if isinstance(xgb_val, list) else xgb_val,
            "nnMlpPrediction": nn_val[0] if isinstance(nn_val, list) else nn_val,
        }

        # Emit the payload safely on the active event loop
        await sio.emit("weather-emit", {"data": payload})
        print("📡 Emitted prediction data successfully!")

    except Exception as e:
        print(f"❌ Something went wrong during prediction: {e}")


async def socket_consumer_loop(sio):
    consumer_config = {
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        "group.id": "socket_group",
        "auto.offset.reset": "latest",
        "enable.auto.commit": False,
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
    nn_model = None
    print("🧠 [Diagnostic] Starting Model Loading...")

    try:
        print("🔍 Loading XGBoost...")
        xgb_model = mlsk.load_model(model_uri="./ml_assets/models/xgboost_model")
        print("✅ XGBoost Loaded!")

        print("🔍 Loading NN MLP...")
        nn_model = mlpy.load_model(model_uri="./ml_assets/models/nn_mlp_model")
        print("✅ NN MLP Loaded!")

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

            await ml_analytics(data_dict, sio, xgb_model, nn_model)

            consumer.commit(asynchronous=True)

    finally:
        consumer.close()
        print("Consumer closed successfuly 🛑")
