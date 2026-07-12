import os
import json
import asyncio
from confluent_kafka.aio import AIOProducer
import random

#  initializing the simulation state
SIM_STATE = {
    "DAP": 45,                  
    "DOY": 172,                 
    "prev_day_deficit_mm": 12.4
}

async def fetch_real_weather_data() -> dict:
    """
    Simulates real-time agricultural weather streams using dynamic calculations.
    Increments days and calculates water deficit using a simplified water balance formula.
    """
    global SIM_STATE

    # Simulate changing weather variables with random natural fluctuations
    tmin = round(random.uniform(14.0, 24.5), 2)
    tmax = round(random.uniform(28.0, 45.5), 2)
    srad = round(random.uniform(20.0, 28.0), 2)
    
    # 80% for no rain , 20% for rain
    rain = 0.0 if random.random() > 0.2 else round(random.uniform(4.0, 17.5), 1)

    # we estimate the evapotranspiration
    approx_evapotranspiration = (tmax * 0.12) + (srad * 0.05)
    
    # New Deficit = Previous Deficit + Water Lost (ET) - Water Gained (Rain)
    current_day_deficit = SIM_STATE["prev_day_deficit_mm"] + approx_evapotranspiration - rain
    current_day_deficit = max(0.0, round(current_day_deficit, 1)) # Deficit cannot be negative

    # Build the exact payload structure required by your SWTD model
    payload = {
        'feature_crop': 'Maize',
        'feature_soil': 'Brun_Calcaire_Silt_Loam',
        'feature_year': 2026,
        'dap': SIM_STATE["DAP"],
        'doy': SIM_STATE["DOY"],
        'tmin': tmin,
        'tmax': tmax,
        'srad': srad,
        'rain': rain,
        'prev_day_deficit_mm': SIM_STATE["prev_day_deficit_mm"]
    }

    # Save today's values to become "previous" values for tomorrow
    SIM_STATE["DAP"] += 1
    SIM_STATE["DOY"] += 1
    SIM_STATE["prev_day_deficit_mm"] = current_day_deficit

    # Reset cycles if simulation runs past standard crop cycles (e.g., end of year)
    if SIM_STATE["DOY"] > 365:
        SIM_STATE["DOY"] = 1
    if SIM_STATE["DAP"] > 150: # Harvest threshold
        SIM_STATE["DAP"] = 1
        SIM_STATE["prev_day_deficit_mm"] = 5.0

    return payload

    # return {'weather' : payload,'time' :datetime().now(),'xgboostPrediction':15, 'nnMlpPrediction':17}

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
                
                payload = json.dumps(raw_data).encode('utf-8')

                delivery_future = await producer.produce(
                    topic=TOPIC, 
                    value=payload, 
                    callback=on_delivery
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