import os
import asyncio
import json
from influxdb_client import Point
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
from confluent_kafka import Consumer, KafkaException, KafkaError, OFFSET_END

async def storing_data(data_dict, write_api):
    try:
        point = (
            Point("soil_metrics")  # This defines your measurement name!
            .tag("feature_crop", data_dict.get("feature_crop", "unknown"))
            .tag("feature_soil", data_dict.get("feature_soil") )
            .field("feature_year", int(data_dict.get("feature_year", 4444) ) )
            .field("DAP", int(data_dict.get("DAP", 00)))
            .field("DOY", int(data_dict.get("DOY", 00)))
            .field("tmin", float(data_dict.get("tmin", 0.0)))
            .field("tmax", float(data_dict.get("tmax", 0.0)))
            .field("srad", float(data_dict.get("srad", 0.0)))
            .field("rain", float(data_dict.get("rain", 0.0)))
            .field("prev_day_deficit_mm", float(data_dict.get("prev_day_deficit_mm", 0.0)))
        )

        await write_api.write(
            bucket=os.getenv("INFLUXDB_BUCKET"),
            org=os.getenv("INFLUXDB_ORG"),
            record=point
        )
        print("record stored successfuly ✅") 
    except Exception as e :
        print(f"we got a problem while storing {e}")
 
async def influx_consumer_loop():
   async with InfluxDBClientAsync(url=os.getenv("INFLUXDB_URL"),token=os.getenv("INFLUXDB_TOKEN"),org=os.getenv("INFLUXDB_ORG")) as client :
        write_api=client.write_api()
        # configuring kafka 
        config = {
            "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:29092"),
            "group.id": "influx_group",
            "auto.offset.reset": "earliest",
            "enable.auto.commit": False
        }

        TOPIC = os.getenv("KAFKA_TOPIC")
        consumer = Consumer(config) 

        def on_assign(consumer,partition):
            for p in partition:
                p.offset= OFFSET_END
            print("Paritions assigned , seeked to end — ready for live data ✅")
    
        consumer.subscribe([TOPIC],on_assign=on_assign)

        print(f"Socket Consumer Subscribed to {TOPIC}, waiting for partition assignment... 👂")

        try:
            while True:
                msg = await asyncio.to_thread(consumer.poll,1.0)

                if msg is None :
                    continue 
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        raise KafkaException(msg.error())    
                data_dict = json.loads(msg.value().decode('utf-8'))

                await storing_data(data_dict,write_api)
                consumer.commit(msg, asynchronous=True)
        finally:
            consumer.close()