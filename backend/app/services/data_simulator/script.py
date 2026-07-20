import random


async def fetch_real_weather_data() -> dict:
    """Generates a completely isolated, standalone agrometeorological scenario

    with randomized physical features to test model inference pipelines.
    """
    # Define the exact pool of available archetypes
    scenarios = [
        "peak_summer_drought",
        "heavy_torrential_rain",
        "irrigation_threshold_tripped",
        "cold_spring_initial_stage",
        "late_season_dry_down",
    ]

    # Automatically pick one scenario type at random
    scenario_type = random.choice(scenarios)

    # Fixed Core Configs
    feature_crop = "Maize"
    feature_soil = "Brun_Calcaire_Silt_Loam"
    feature_year = 2026

    # Apply explicit logical boundary rules based on the picked scenario
    if scenario_type == "peak_summer_drought":
        doy = random.randint(180, 240)  # Deep summer
        dap = random.randint(65, 100)  # Mid-season peak water demand
        tmin = round(random.uniform(22.0, 26.0), 2)
        tmax = round(random.uniform(38.0, 47.0), 2)  # Extreme heat
        srad = round(random.uniform(26.0, 30.0), 2)  # Intense solar radiation
        rain = 0.0
        prev_deficit = round(
            random.uniform(20.0, 29.5), 2
        )  # Just below irrigation trigger

    elif scenario_type == "heavy_torrential_rain":
        doy = random.randint(30, 120)  # Late winter / early spring
        dap = random.randint(10, 50)
        tmin = round(random.uniform(8.0, 13.0), 2)
        tmax = round(random.uniform(16.0, 22.0), 2)
        srad = round(random.uniform(10.0, 15.0), 2)  # Overcast sky
        rain = round(random.uniform(25.0, 50.0), 2)  # Heavy downpour
        prev_deficit = round(random.uniform(5.0, 15.0), 2)

    elif scenario_type == "irrigation_threshold_tripped":
        doy = random.randint(150, 210)
        dap = random.randint(45, 90)
        tmin = round(random.uniform(17.0, 21.0), 2)
        tmax = round(random.uniform(32.0, 36.0), 2)
        srad = round(random.uniform(22.0, 26.0), 2)
        rain = 0.0
        prev_deficit = round(
            random.uniform(30.1, 35.0), 2
        )  # Explicitly crosses the 30mm threshold

    elif scenario_type == "cold_spring_initial_stage":
        doy = random.randint(70, 110)
        dap = random.randint(1, 19)  # Initial stage (Low usage)
        tmin = round(random.uniform(5.0, 9.0), 2)
        tmax = round(random.uniform(14.0, 19.0), 2)
        srad = round(random.uniform(12.0, 17.0), 2)
        rain = round(random.uniform(0.0, 4.0), 2)
        prev_deficit = round(random.uniform(0.0, 5.0), 2)

    else:  # late_season_dry_down
        doy = random.randint(245, 285)
        dap = random.randint(110, 145)  # Late stage / approaching harvest
        tmin = round(random.uniform(12.0, 16.0), 2)
        tmax = round(random.uniform(23.0, 28.0), 2)
        srad = round(random.uniform(15.0, 19.0), 2)
        rain = 0.0
        prev_deficit = round(random.uniform(15.0, 25.0), 2)

    # Clean structured feature output matching your model input expectations
    return {
        "feature_crop": feature_crop,
        "feature_soil": feature_soil,
        "feature_year": feature_year,
        "DAP": dap,
        "DOY": doy,
        "tmin": tmin,
        "tmax": tmax,
        "srad": srad,
        "rain": rain,
        "prev_day_deficit_mm": prev_deficit,
    }