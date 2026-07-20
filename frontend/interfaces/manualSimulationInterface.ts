export interface FormState {
  success: boolean;
  message: string;
  prediction: number | null;
  errors: string | null;
}

export interface numericalInput {
  title: string;
  name:
    | "feature_crop"
    | "feature_soil"
    | "feature_year"
    | "DAP"
    | "DOY"
    | "tmin"
    | "tmax"
    | "srad"
    | "rain"
    | "prev_day_deficit_mm";
  type: "string" | "number";
  unit: string;
}
