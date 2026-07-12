import { io } from "socket.io-client";
import { useEffect, useState } from "react";

interface weatherType {
    feature_crop: string;
    feature_soil: string;
    feature_year: number;
    dap: number;
    doy: number;
    tmin: number;
    tmax: number;
    srad: number;
    rain: number;
    prev_day_deficit_mm: number;
}

interface RecordWeather {
    weather: weatherType;
    time: string;
    xgboostPrediction: number;
    nnMlpPrediction: number;
}

// const  {feature_crop,feature_soil,feature_year,dap,doy,tmin,tmax,srad,rain,prev_day_deficit_mm}=payload

export default function useSocketWeather({ url }: { url: string }) {
    const [status, setStatus] = useState<"connected" | "disconnected">("disconnected",);

    const [weatherData, setweatherData] = useState<RecordWeather>();

    const handleWeatherEmit = (payload: any) => {
        const { weather, xgboostPrediction, nnMlpPrediction, time } = payload.data;
        console.log(weather)

        const record = {
            weather,
            time,
            xgboostPrediction,
            nnMlpPrediction,
        };
        console.log(record)

        setweatherData(record);
    };

    useEffect(() => {
        const socket = io(url, {
            path: "/ws/socket.io/",
            transports: ["websocket"],
            withCredentials: true,
        });

        socket.on("connect", () => setStatus("connected"));

        socket.on("disconnected", () => setStatus("disconnected"));

        socket.on("weather-emit", handleWeatherEmit);

        return () => {
            socket.off("weather-emit", handleWeatherEmit);
            socket.disconnect();
        };
    }, [url, handleWeatherEmit]);

    return { weatherData, status };
}
