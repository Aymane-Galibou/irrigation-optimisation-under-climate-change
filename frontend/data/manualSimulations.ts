import { numericalInput } from "@/interfaces/manualSimulationInterface";



export const categoricalInputs = [
  {
    title: "Crop Type",
    name: "feature_crop",
    selectItems: [
      {
        title: "Maize (default choice)",
        value: "Maize",
      },
      {
        title: "Sorghum Crop",
        value: "Sorghum",
      },
      {
        title: "Wheat Crop",
        value: "Wheat",
      },
    ],
  },
  {
    title: "Soil Type",
    name: "feature_soil",
    selectItems: [
      {
        title: "Brun Calcaire / Silt Loam",
        value: "Brun_Calcaire_Silt_Loam",
      },
      {
        title: "Argilo-Sableux",
        value: "Argilo_Sableux",
      },
    ],
  },
];


export const numericalInputs:numericalInput[] = [
  {
    title: "Previous Deficit",
    name: "prev_day_deficit_mm",
    type:"number",
    unit:"mm",
  },
    {
    title: "Rain Rate",
    name: "rain",
    type:"number",
      unit:"mm",
  },
    {
    title: "Solar Radiation",
    name: "srad",
    type:"number",
      unit:"w/m2",
  },
    {
    title: "Day Of Year",
    name: "DOY",
    type:"number",
    unit:"-",
  },
    {
    title: "Day After Planting",
    name: "DAP",
    type:"number",
      unit:"-",
  },
    {
    title: "Year",
    name: "feature_year",
    type:"number",
      unit:"-",
  },

      {
    title: "Tmin (°C)",
    name: "tmin",
    type:"number",
        unit:"(°C)",
  },


      {
    title: "Tmax (°C)",
    name: "tmax",
    type:"number",
    unit:"(°C)",
  },

];