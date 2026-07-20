import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { RecordWeather } from "@/interfaces/weatherInterface";

// const  {feature_crop,feature_soil,feature_year,dap,doy,tmin,tmax,srad,rain,prev_day_deficit_mm}=payload

export default function useSocketWeather({ url }: { url: string }) {
  const [status, setStatus] = useState<"connected" | "disconnected">(
    "disconnected",
  );

  const [weatherData, setweatherData] = useState<RecordWeather>();

  useEffect(() => {
    const handleWeatherEmit = (payload: any) => {
      const { weather, xgboostPrediction, nnMlpPrediction, time } =
        payload.data;
      console.log(weather);

      const record = {
        weather,
        time,
        xgboostPrediction,
        nnMlpPrediction,
      };
      console.log(record);

      setweatherData(record);
    };
    const socket = io(url, {
      path: "/ws/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => setStatus("connected"));

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });
    socket.on("weather-emit", handleWeatherEmit);

    return () => {
      socket.off("weather-emit", handleWeatherEmit);
      socket.disconnect();
    };
  }, [url]);

  return { weatherData, status };
}
