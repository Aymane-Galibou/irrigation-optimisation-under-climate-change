import pandas as pd
import numpy as np
from datetime import date, timedelta
from DSSATTools import DSSAT
from DSSATTools.crop import Sorghum, Maize
from DSSATTools.weather import WeatherStation
from DSSATTools.soil import SoilProfile, SoilLayer
from DSSATTools.filex import (
    Field, Planting, SimulationControls,
    Irrigation, SCGeneral, SCManagement, SCOutputs
)


def _soil_field_capacity_mm(soil_profile: SoilProfile) -> float:
    total_fc_mm = 0.0
    prev_depth = 0.0
    for layer in soil_profile.table:
        thickness_cm = layer["slb"] - prev_depth
        total_fc_mm += layer["sdul"] * thickness_cm * 10.0
        prev_depth = layer["slb"]
    return total_fc_mm


def generate_synthetic_heatwave_weather(nasa_climate_df: pd.DataFrame,
                                         n_events: int = 15,
                                         event_length_days: int = 5,
                                         tmax_boost_range=(6.0, 12.0),
                                         seed: int = 7) -> pd.DataFrame:

    rng = np.random.default_rng(seed)
    df = nasa_climate_df.copy()
    df['date'] = pd.to_datetime(df['date'])

    # selecting the hot dry days (top 15 %)
    hot_dry_days = df[(df['tmax'] > df['tmax'].quantile(0.85)) & (df['rain'] < 2.0)]
    
    if hot_dry_days.empty:
        return df

    # selecting differents dates of those days above
    anchor_dates = rng.choice(hot_dry_days['date'].values, size=min(n_events, len(hot_dry_days)), replace=False)
    
    # defining threshold of srad ( top 30 %)
    srad_threshold = df['srad'].quantile(0.7)

    for anchor in anchor_dates:
        boost = rng.uniform(*tmax_boost_range)

        # generating window events ( for each date we applied for 5 next days)
        event_dates = pd.date_range(pd.Timestamp(anchor), periods=event_length_days, freq='D')
        
        # filter to apply the modification on only the dates mentionned in event_dates
        mask = df['date'].isin(event_dates)
        
        if not mask.any():
            continue
            
        # applying the modification 
        df.loc[mask, 'tmax'] = df.loc[mask, 'tmax'] + boost
        df.loc[mask, 'tmin'] = df.loc[mask, 'tmin'] + boost * 0.5   
        df.loc[mask, 'rain'] = 0.0                                  
        df.loc[mask, 'srad'] = df.loc[mask, 'srad'].clip(lower=srad_threshold) 

    return df

# nasa_climate_df is returned by the personalized function that we built
def dssat_calculator(nasa_climate_df: pd.DataFrame):

    dssat = DSSAT()
    latitude = 32.336
    longitude = -6.295

    # soils
    tadla_soils = {
        "Hamri_Silty_Clay_Loam": SoilProfile(
            name="BM_HAMR001", soil_series_name="Tadla Hamri", site="Beni Mellal", country="Morocco",
            lat=latitude, long=longitude, soil_data_source="Tadla Regional Baseline", soil_clasification="SCL",
            scs_family="Fine-loamy", scom="", salb=0.15, slu1=6.0, sldr=0.6, slro=70.0, slnf=1.0, slpf=0.85,
            smhb="IB001", smpx="IB001", smke="IB001",
            table=[
                SoilLayer(slb=15, slmh="", slll=0.14, sdul=0.28, ssat=0.42, srgf=1.0, ssks=8.0, sbdm=1.35, sloc=1.2, slcl=30, slsi=40, slcf=0, slhw=6.8, scec=18.0),
                SoilLayer(slb=30, slmh="", slll=0.15, sdul=0.29, ssat=0.41, srgf=0.8, ssks=6.0, sbdm=1.38, sloc=0.8, slcl=32, slsi=38, slcf=0, slhw=6.9),
                SoilLayer(slb=60, slmh="", slll=0.16, sdul=0.30, ssat=0.40, srgf=0.5, ssks=4.0, sbdm=1.42, sloc=0.5, slcl=35, slsi=35, slcf=0, slhw=7.0),
                SoilLayer(slb=100, slmh="", slll=0.17, sdul=0.31, ssat=0.39, srgf=0.2, ssks=2.0, sbdm=1.45, sloc=0.2, slcl=35, slsi=35, slcf=0, slhw=7.1)
            ]
        ),
        "Tirs_Clay": SoilProfile(
            name="BM_TIRS001", soil_series_name="Tadla Tirs", site="Beni Mellal", country="Morocco",
            lat=latitude, long=longitude, soil_data_source="Tadla Regional Baseline", soil_clasification="C",
            scs_family="Fine-clayey", scom="", salb=0.12, slu1=5.0, sldr=0.4, slro=85.0, slnf=1.0, slpf=0.90,
            smhb="IB001", smpx="IB001", smke="IB001",
            table=[
                SoilLayer(slb=15, slmh="", slll=0.22, sdul=0.38, ssat=0.48, srgf=1.0, ssks=2.0, sbdm=1.25, sloc=1.5, slcl=45, slsi=35, slcf=0, slhw=7.2, scec=25.0),
                SoilLayer(slb=30, slmh="", slll=0.24, sdul=0.39, ssat=0.47, srgf=0.8, ssks=1.5, sbdm=1.30, sloc=1.0, slcl=48, slsi=32, slcf=0, slhw=7.3),
                SoilLayer(slb=60, slmh="", slll=0.25, sdul=0.40, ssat=0.46, srgf=0.5, ssks=1.0, sbdm=1.35, sloc=0.6, slcl=50, slsi=30, slcf=0, slhw=7.5),
                SoilLayer(slb=100, slmh="", slll=0.26, sdul=0.41, ssat=0.45, srgf=0.2, ssks=0.8, sbdm=1.40, sloc=0.3, slcl=52, slsi=28, slcf=0, slhw=7.6)
            ]
        ),
        "Brun_Calcaire_Silt_Loam": SoilProfile(
            name="BM_BCAL001", soil_series_name="Tadla Brun Calcaire", site="Beni Mellal", country="Morocco",
            lat=latitude, long=longitude, soil_data_source="Tadla Regional Baseline", soil_clasification="SIL",
            scs_family="Coarse-loamy", scom="", salb=0.18, slu1=7.5, sldr=0.7, slro=55.0, slnf=1.0, slpf=0.80,
            smhb="IB001", smpx="IB001", smke="IB001",
            table=[
                SoilLayer(slb=15, slmh="", slll=0.10, sdul=0.22, ssat=0.38, srgf=1.0, ssks=14.0, sbdm=1.40, sloc=1.0, slcl=18, slsi=52, slcf=0, slhw=7.8, scec=14.0),
                SoilLayer(slb=30, slmh="", slll=0.11, sdul=0.23, ssat=0.37, srgf=0.8, ssks=12.0, sbdm=1.42, sloc=0.7, slcl=20, slsi=50, slcf=0, slhw=7.9),
                SoilLayer(slb=60, slmh="", slll=0.12, sdul=0.24, ssat=0.37, srgf=0.4, ssks=10.0, sbdm=1.45, sloc=0.4, slcl=22, slsi=48, slcf=0, slhw=8.0),
                SoilLayer(slb=100, slmh="", slll=0.12, sdul=0.24, ssat=0.36, srgf=0.1, ssks=8.0, sbdm=1.48, sloc=0.2, slcl=22, slsi=48, slcf=0, slhw=8.1)
            ]
        )
    }

    # calculatin the soid field capacity in mm per soil type
    soil_fc_mm = {name: _soil_field_capacity_mm(soil) for name, soil in tadla_soils.items()}

    # crops
    crops = {
        'Sorghum': Sorghum('IB0026'),
        'Maize': Maize('IB0001'),
    }

    # defining 6 differents strategies , automatically triggered by DSSAT
    import random
    random.seed(42)
    n_random_strategies = 6
    irrigation_strategies = {
        f'Auto_MAD_{i}': {
            'idep': 30,
            'ithr': random.uniform(25, 80),   
            'iept': 100,
            'iame': 'IR001',
            'ioff': 'IB001',
        }
        for i in range(n_random_strategies)
    }
    # adding a non-irrigation strategie 
    irrigation_strategies['Rainfed'] = None

    all_historical_records = []

    # selecting available years from data-climate-passed as parameter (kandiro liha fetch mn GEE)
    nasa_climate_df['date'] = pd.to_datetime(nasa_climate_df['date'])
    available_years = sorted(nasa_climate_df['date'].dt.year.unique())
    print(f"climate year available: {available_years}")

    # loop over years
    for target_year in available_years:
        print(f"Processing Climate Projection Year : {target_year}")
        
        # loop over crop type
        for crop_name, crop_obj in crops.items():

            # handling plating & simulation date of each crop type 
            if crop_name == 'Sorghum':
                sim_start = date(target_year, 5, 1)
                plant_date = date(target_year, 5, 10)
                sim_end = date(target_year, 10, 15)
            elif crop_name == 'Maize':
                sim_start = date(target_year, 5, 1)
                plant_date = date(target_year, 5, 8)
                sim_end = date(target_year, 10, 30)
            # transforming the column date into datetime type to avoid calcul problem 
            nasa_climate_df['date'] = pd.to_datetime(nasa_climate_df['date'])

            # creating date filter for each crop type (Maize periode isn't wheat periode ...)
            span_mask = (nasa_climate_df['date'] >= pd.Timestamp(sim_start)) & (nasa_climate_df['date'] <= pd.Timestamp(sim_end))
            
            # extracting weather periode of the crop based on span_mask defined above
            crop_weather_df = nasa_climate_df[span_mask].copy()

            # if the weather periode is missing
            if crop_weather_df.empty:
                print(f" [!] Missing weather records for window {sim_start} to {sim_end}. Skipping.")
                continue
            
            # creating dssat weather instance
            wst = WeatherStation(crop_weather_df, insi='NASA', lat=latitude, long=longitude)

            # loop over soil types 
            for soil_name, soil_obj in tadla_soils.items():

                # defining the field ( through weather and soil type)
                field = Field(id_field='TEST0001', wsta=wst, id_soil=soil_obj)

                # creating dssat planting instance (we give it the planting date ..)
                planting = Planting(
                    pdate=plant_date,
                    ppop=15, ppoe=15,
                    plme='S', plds='R', plrs=50
                )

                # loop over strategies 
                for strategy_name, config in irrigation_strategies.items():

                    # for the non-irrigation strategie
                    if config is None:
                        management = SCManagement(irrig='N')
                        irrigation_obj = None
                    else: # for other strategies
                        management = SCManagement(irrig='A')
                        irrigation_obj = Irrigation(
                            table=[],
                            idep=config['idep'],
                            ithr=config['ithr'],
                            iept=config['iept'],
                            iame=config['iame'],
                            ioff=config['ioff'],
                        )
                    
                    # creating the dssat simulation controls instance
                    sim_controls = SimulationControls(
                        general=SCGeneral(sdate=sim_start, nyers=1, nreps=1),
                        management=management,
                        outputs=SCOutputs(waout='Y', grout='Y', fropt=1)
                    )

                    # running the simulation
                    try:
                        dssat.run_treatment(
                            field=field,
                            cultivar=crop_obj,
                            planting=planting,
                            simulation_controls=sim_controls,
                            irrigation=irrigation_obj
                        )
                        
                        # checking the ouput file existence 
                        if 'PlantGro' in dssat.output_tables and 'SoilWat' in dssat.output_tables:
                            df_gro = dssat.output_tables['PlantGro'].copy()
                            df_wat = dssat.output_tables['SoilWat'].copy()

                            # loop over the two data-set extracted from dssat ouput files
                            for df in (df_gro, df_wat):
                                # we should handle this because by default the date is returned by dssat as a first column but without label 
                                if 'DATE' not in df.columns:
                                    df.reset_index(inplace=True)
                                    df.rename(columns={df.columns[0]: 'DATE'}, inplace=True)
                                df['DATE'] = pd.to_datetime(df['DATE'])

                            # checking cumulated irrigation column existence
                            if 'IRRC' not in df_wat.columns:
                                print(f" [!] IRRC not found in SoilWat output for {target_year}-{crop_name}-{soil_name}.")
                                continue
                            
                            # sorting data-set of SoilWat ASCENDING by DATE then deleting DATE column   
                            df_wat = df_wat.sort_values('DATE').reset_index(drop=True)
                            df_wat['IRRC'] = df_wat['IRRC'].fillna(0.0)

                            # the irrigation applied today is the IRRC(today) - IRRC(yesterday)
                            df_wat['irrigation_applied_today_mm'] = df_wat['IRRC'].diff()

                            # correcting the first day of planting to avoid NaN value (cuz .diff() for the first day it has no previous value so it's NaN)
                            df_wat.loc[df_wat.index[0], 'irrigation_applied_today_mm'] = df_wat.loc[df_wat.index[0], 'IRRC']

                            # replacing all the negative value by 0
                            df_wat['irrigation_applied_today_mm'] = df_wat['irrigation_applied_today_mm'].clip(lower=0.0)
                            
                            # checking the SWTD existence
                            if 'SWTD' not in df_wat.columns:
                                continue
                            
                            # extracting soil capacity 
                            fc_mm = soil_fc_mm[soil_name]

                            # extracting the SWTD column
                            df_wat['soil_water_content_mm'] = df_wat['SWTD']
                            
                            # to know the exact soil water content we should substract the irrigation applied automatically by dssat
                            df_wat['soil_water_content_before_irrigation_mm'] = (df_wat['soil_water_content_mm'] - df_wat['irrigation_applied_today_mm'])
                            
                            # calculating the SWTD deficit in mm & replacing the negative value by 0
                            df_wat['SWTD_deficit_mm'] = (fc_mm - df_wat['soil_water_content_before_irrigation_mm']).clip(lower=0.0)

                            # extracting the important columns (calculated columns)
                            df_wat_target = df_wat[[
                                'DATE', 'SWTD_deficit_mm',
                                'soil_water_content_mm',
                                'soil_water_content_before_irrigation_mm',
                                'irrigation_applied_today_mm',
                            ]].copy()

                            # merging the calculated columns with PlantGro columns (since 40 columns in total)
                            df_step = pd.merge(df_gro, df_wat_target, on='DATE', how='left')
                            df_step['SWTD_deficit_mm'] = df_step['SWTD_deficit_mm'].ffill()

                            # extracting the previous day SWTD 
                            df_step['prev_day_deficit_mm'] = df_step['SWTD_deficit_mm'].shift(1).fillna(0.0)
                            
                            # adding some feature columns
                            df_step['feature_year'] = target_year
                            df_step['feature_crop'] = crop_name
                            df_step['feature_soil'] = soil_name

                            # mergin the df_step with weather periode 
                            df_merged = pd.merge(
                                df_step,
                                crop_weather_df[['date', 'tmax', 'tmin', 'srad', 'rain']],
                                left_on='DATE', right_on='date', how='left'
                            )

                            # removing date column cuz no need more
                            if 'date' in df_merged.columns:
                                df_merged.drop(columns=['date'], inplace=True)

                            all_historical_records.append(df_merged)
                        else:
                            print(f"Missing PlantGro/SoilWat output tables for "f"{target_year}-{crop_name}-{soil_name}-{strategy_name}.")

                    except Exception as e:
                        print(f"Crash on {target_year}-{crop_name}-{soil_name}-{strategy_name}: {e}")

    dssat.close()
    if all_historical_records:
        master_dataset = pd.concat(all_historical_records, ignore_index=True)
        
        # defining machine learning usefull columns
        ml_features = [
            'feature_crop', 'feature_soil','feature_year',
            'prev_day_deficit_mm',
            'DAP', 'DOY',
            'tmax', 'tmin', 'srad', 'rain',
        ]

        ml_targets = [
            'SWTD_deficit_mm',
        ]


        target_columns = ml_features + ml_targets
        final_columns = [col for col in target_columns if col in master_dataset.columns]
        missing_columns = [col for col in target_columns if col not in master_dataset.columns]

        if missing_columns:
            print(f" [!] Expected ML columns not found and dropped: {missing_columns}")

        ml_ready_dataset = master_dataset[final_columns].copy()

        print(f"\n--- MATRIX GENERATION SUCCESSFUL : {len(ml_ready_dataset)} rows \n {len(final_columns)} ML columns ---")
        return ml_ready_dataset
    else:
        print("Zero dataset entries generated. Verify execution logs.")
        return None