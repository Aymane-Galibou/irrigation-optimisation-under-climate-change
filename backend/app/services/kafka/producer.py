import os
import json
import asyncio
from confluent_kafka.aio import AIOProducer
import pandas as pd 

async def run_producer(app):
    TOPIC = os.getenv("KAFKA_TOPIC")
    config = {
    'bootstrap.servers': os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanism': 'PLAIN',
    'sasl.username': os.getenv("KAFKA_SASL_USERNAME"),
    'sasl.password': os.getenv("KAFKA_SASL_PASSWORD"),
    'ssl.ca.location': '/etc/ssl/certs/ca-certificates.crt',
}
    producer = AIOProducer(config)

    def on_delivery(err, msg):
        if err:
            print(f"[Producer] Delivery failed: {err}")
        else:
            print(f"[Producer] Message delivered to {msg.topic()} [{msg.partition()}]")

    feature_crop = app.state.feature_crop

    # preaparing data block 
    try:
        # loading the dataset
        df = pd.read_csv("./app/services/data_simulator/weather.csv")
        
        # loading the planting date from the state 
        planting_date = app.state.planting_date

        # calculating the DAP
        DOY_planting = int(planting_date.strftime('%j'))
        df['DAP'] = df['DOY'] - DOY_planting

        # keeping only the crop season 
        df = df[df['DAP'] >= 0]

    except Exception as e : 
        print(f"there is a probleme while transforming this data {e}")


    try:
        for index, row in df.iterrows():
            try:
                # building the payload 
                data_formated = {
                    "feature_crop": feature_crop,
                    "feature_soil": 'Tirs_Clay',
                    "feature_year": int(row['YEAR']),
                    "DAP": int(row['DAP']),
                    "DOY": int(row["DOY"]),
                    "tmin": float(row['tmin']),
                    "tmax": float(row['tmax']),
                    "srad": float(row['srad']),
                    "rain": float(row['rain']),
                    "prev_day_deficit_mm": float(app.state.prev_deficit_mm,)
                }
                payload = json.dumps(data_formated).encode("utf-8")

                await producer.produce(
                    topic=TOPIC, value=payload, callback=on_delivery
                )
                print("🚀 Message envoyé pour la station")

                # waiting 6 seconds 
                await asyncio.sleep(6)

            except Exception as e:
                print(f"PROBLEME WITH KAFKA PRODUCER --- : {e}")
                await asyncio.sleep(5)

    finally:
        print("Stopping producer, flushing remaining messages... 🛑 ")
        await producer.flush()
        await producer.close()
