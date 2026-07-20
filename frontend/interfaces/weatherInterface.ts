import { ReactNode } from "react";


export interface weatherType {
  feature_crop: string;
  feature_soil: string;
  feature_year: number;
  DAP: number;
  DOY: number;
  tmin: number;
  tmax: number;
  srad: number;
  rain: number;
  prev_day_deficit_mm: number;
  _time?: string;
}

export interface RecordWeather {
  weather: weatherType;
  time: string;
  xgboostPrediction: number;
  nnMlpPrediction: number;
}


export interface ModelCardProps {
  modelTag: string;
  modelName: string;
  tagClass: string;
  iconBgClass: string;
  iconColorClass: string;
  valueColorClass: string;
  predictionValue: number;
  defaultValue: string;
  historyTitle: string;
  history: number[];
  barColorClass?: string;
  weatherData: any;
  icon: ReactNode;
}