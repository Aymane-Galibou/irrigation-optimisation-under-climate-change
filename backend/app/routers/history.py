from fastapi import APIRouter,Request,HTTPException
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
import os

router = APIRouter(prefix="/history",tags=["history"])

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

@router.get("/")
async def get_history(request:Request):
    flux_query = f'''
        from(bucket: "{INFLUXDB_BUCKET}")
            |> range(start: {"-24h"})
            |> filter(fn: (r) => r["_measurement"] == "soil_metrics")
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> sort(columns: ["_time"], desc: false)
        '''
    results = []
    try :
        async with InfluxDBClientAsync(url=INFLUXDB_URL,token=INFLUXDB_TOKEN,org=INFLUXDB_ORG) as client:
            # creatin the query cursor 
            query_api = client.query_api()
 
            # executing the query 
            record_stream = await query_api.query_stream(query=flux_query,org=INFLUXDB_ORG)

            async for record in record_stream :
                record_data = record.values
                results.append(record_data)

        return {"status":"success","ok":True,"data":results}
    except Exception as e : 
        raise HTTPException(status_code=500, detail=f"Failed to fetch data from InfluxDB: {str(e)}")