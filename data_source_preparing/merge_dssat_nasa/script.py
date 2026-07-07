from data_source_preparing.weather_data.get_nasa_nex import get_nasa_weather
from data_source_preparing.dssat_simulation.dssat_calculation_imp import (dssat_calculator, generate_synthetic_heatwave_weather)
import pandas as pd

latitude = 32.336
longitude = -6.295

start_date = '2028-01-01'
end_date   = '2040-12-31'
climate_model = 'ACCESS-CM2'

all_ml_datasets = []

# loop over scenarios
for climate_scenario in ['ssp245', 'ssp585']:
    print(f"=== Scenario climatique : {climate_scenario} ===")

    # we receive at first data fetched from google earht engine
    weather_df = get_nasa_weather(latitude, longitude, start_date, end_date, climate_scenario, climate_model)

    # we should inject some high temperature because on of the most limit of NASA/NEX-GDDP-CMIP6 is smooth temperature even in differents models and differents scenarios
    weather_df = generate_synthetic_heatwave_weather(weather_df, n_events=20, event_length_days=5)

    # passing data to dssat calculator 
    ml_dataset = dssat_calculator(weather_df)
    
    # adding the climate scenaroi to the data-set columns
    if ml_dataset is not None:
        ml_dataset['feature_climate_scenario'] = climate_scenario
        all_ml_datasets.append(ml_dataset)

# transforming data into pandas dataframe
final_dataset = pd.concat(all_ml_datasets, ignore_index=True)

# saving dataframe into csv file format
final_dataset.to_csv('./ia-traitement/ml_assets/data/xdata.csv', index=False)

print(f"Dataset final : {len(final_dataset)} lignes, \n scenarios : {final_dataset['feature_climate_scenario'].unique().tolist()}")
