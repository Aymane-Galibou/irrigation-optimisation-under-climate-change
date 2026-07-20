"use server";

import { FormState } from "@/interfaces/manualSimulationInterface";

const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL_SERVER;

export default async function simulatePredictionAction(
  previousState: FormState,
  formData: FormData,
) {
  try {
    const feature_crop = formData.get("feature_crop")?.toString() || "";
    const feature_soil = formData.get("feature_soil")?.toString() || "";

    const feature_year = formData.get("feature_year")
      ? Number(formData.get("feature_year"))
      : null;
    const DAP = formData.get("DAP") ? Number(formData.get("DAP")) : null;
    const DOY = formData.get("DOY") ? Number(formData.get("DOY")) : null;
    const tmin = formData.get("tmin") ? Number(formData.get("tmin")) : null;
    const tmax = formData.get("tmax") ? Number(formData.get("tmax")) : null;
    const srad = formData.get("srad") ? Number(formData.get("srad")) : null;
    const rain = formData.get("rain") ? Number(formData.get("rain")) : null;
    const prev_day_deficit_mm = formData.get("prev_day_deficit_mm")
      ? Number(formData.get("prev_day_deficit_mm"))
      : null;

    if (tmin === null || tmax === null || DAP === null || DOY === null) {
      return {
        success: false,
        message: "Validation Error",
        errors: "All numeric weather fields are required.",
        prediction: null,
      };
    }

    const payload = {
      feature_crop,
      feature_soil,
      feature_year,
      DAP,
      DOY,
      tmin,
      tmax,
      srad,
      rain,
      prev_day_deficit_mm,
    };

    console.log(payload)
    const response = await fetch(`${backendPath}/api/v1/simulations/manual`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Backend server error",
        errors: `Server returned status code ${response.status}`,
        prediction: null,
      };
    }

    const responseParsed = await response.json();
    const predictionVal = responseParsed.prediction.length > 0 ? responseParsed.prediction[0] : responseParsed.prediction 
    console.log(responseParsed);

    return {
      success: true,
      message: "Prediction calculated successfully",
      errors: null,
      prediction: Number(predictionVal),
    };
  } catch (e) {
    console.error("Server Action Exception:", e);
    return {
      success: false,
      message: "Network error occurred",
      errors: e instanceof Error ? e.message : String(e),
      prediction: null,
    };
  }
}
