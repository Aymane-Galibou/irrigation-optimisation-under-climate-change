import ee 
import pandas as pd 
from datetime import datetime

"""
lat : latitude
long : longitude
sd : start date
ed : end date
cs : climate scenario
cm : climate model
"""

def get_nasa_weather(lat,long,sd,ed,cs,cm):

    ee.Authenticate()

    ee.Initialize(project="smart-irrigation-dssat")

    point=ee.Geometry.Point([lat,long])

    # getting the whole ImageCollection
    data_set=(
        ee.ImageCollection("NASA/GDDP-CMIP6")
        .filterDate(sd,ed)
        .filter(ee.Filter.eq('model',cm))
        .filter(ee.Filter.eq('scenario',cs))
        .select(['hurs','huss','pr','tas','tasmin','tasmax','rsds'])
    )

    # Map over the dataset to extract only the specific field that we defined above
    def extract_specific_pixel(image):
        stats=image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=25000
        )
        return ee.Feature(None,stats).set('date',image.date().format('yyyy-MM-dd'))

    # Create an empty list to gather all daily rows
    all_records = []
    start_year = datetime.strptime(sd, "%Y-%m-%d").year
    end_year = datetime.strptime(ed, "%Y-%m-%d").year

    # Loop year by year from 2028 to 2060 (otherwise we will get an accumulation error)
    for year in range(start_year, end_year + 1):
        print(f"Extracting climate projections for year: {year}...")
        
        # Filter the main collection down to just this single year
        yearly_dataset = data_set.filterDate(f'{year}-01-01', f'{year}-12-31')
        
        # trigger the map loop on the GEE cloud (for a specific year)
        extracted_features = yearly_dataset.map(extract_specific_pixel).getInfo()
        
        # parses the results into a Pandas DataFrame
        """
            to understand this comprehension loop check the returned type 
            given by GEE (normaly mkhdoum b JS just equivalent between  
            dictonnaries & objects)
        """
        records = [feat['properties'] for feat in extracted_features['features'] if feat['properties']]
        
        # Append to our master list
        all_records.extend(records)
    
    df_future = pd.DataFrame(all_records)

    # transforming temperature from kelvin to celicius
    df_future["tas"]=df_future["tas"] - 273.15
    df_future["tmax"]=df_future["tasmax"] - 273.15
    df_future["tmin"]=df_future["tasmin"] - 273.15

    # calculating rain based on precipitation
    df_future["rain"] = df_future["pr"] * 86400

    # transforming the surface downwelling shortwave radiation
    df_future["srad"] = df_future["rsds"] * 0.0864

    # filtering columns to keep only those required by DSSAT
    final_columns = ["tmax", "tmin", "rain", "srad","date"]

    df_dssat_ready = df_future[final_columns]
    return df_dssat_ready


if __name__ == "__main__":
    # defining our field 
    latitude = 32.336
    longitude = -6.295

    # weather periode from .. to ..
    start_date = '2028-01-01'
    end_date = '2060-12-31'

    # climate change variable
    climate_scenario = 'ssp245'
    climate_model = 'ACCESS-CM2'

    results = get_nasa_weather(latitude,longitude,start_date,end_date,climate_scenario,climate_model)

    print(results.head())