import os
import json
import asyncio
from confluent_kafka.aio import AIOProducer
from app.services.data_simulator.script import fetch_real_weather_data



async def run_producer():
    KAFKA_BROKER = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
    TOPIC = os.getenv("KAFKA_TOPIC")

    producer = AIOProducer(
        {"bootstrap.servers": KAFKA_BROKER, "client.id": "weather-data-producer"}
    )

    def on_delivery(err, msg):
        if err:
            print(f"[Producer] Delivery failed: {err}")
        else:
            print(f"[Producer] Message delivered to {msg.topic()} [{msg.partition()}]")

    try:
        while True:
            try:
                raw_data = await fetch_real_weather_data()

                payload = json.dumps(raw_data).encode("utf-8")

                await producer.produce(
                    topic=TOPIC, value=payload, callback=on_delivery
                )
                print("🚀 Message envoyé pour la station")

                await asyncio.sleep(2)

            except Exception as e:
                print(f"PROBLEME WITH KAFKA PRODUCER --- : {e}")
                await asyncio.sleep(5)

    finally:
        print("Stopping producer, flushing remaining messages... 🛑 ")
        await producer.flush()
        await producer.close()
