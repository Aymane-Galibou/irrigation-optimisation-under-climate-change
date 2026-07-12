import os
from confluent_kafka import Consumer,KafkaException
import json
from datetime import datetime
import asyncio


async def ml_analytics(data_dict: dict, sio, model=None):
     

    payload = {
        'weather' : data_dict,
        'time' :datetime.now().isoformat(),
        'xgboostPrediction':15,
        'nnMlpPrediction':17
    }

    await sio.emit("weather-emit", {"data":payload})
    print("📡 Emitted data f")



async def socket_consumer_loop(sio):
    consumer_config= {
        'bootstrap.servers':os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        "group.id":"socket_group",
        "auto.offset.reset": "latest",
        "enable.auto.commit": False,
    }
    TOPIC = os.getenv("KAFKA_TOPIC")

    consumer = Consumer(consumer_config)

    def on_assign(consumer, partitions):
        for p in partitions:
            p.offset = -1  
        consumer.assign(partitions)
        print("[Socket Consumer] Partitions assigned, seeked to end — ready for live data ✅")

    consumer.subscribe([TOPIC],on_assign=on_assign) 

    print(f"[Socket Consumer] Subscribed to {TOPIC}, waiting for partition assignment... 👂")

    try:
        while True:
            msg = await asyncio.to_thread(consumer.poll, 1.0)
            if msg is None : 
                continue

            if msg.error():
                raise KafkaException(msg.error())
            
            data_dict = json.loads(msg.value().decode("utf-8"))

            await ml_analytics(data_dict,sio)

            consumer.commit(asynchronous=True)

    finally:
        consumer.close()
        print("Consumer closed successfuly 🛑")