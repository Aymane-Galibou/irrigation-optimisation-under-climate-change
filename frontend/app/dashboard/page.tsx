"use client";
import { useEffect, useState } from "react";
import useSocketWeather from "@/hooks/useSocketWeather";
import DescriptorGrid from "@/components/ui/DescriptorGrid";
import ModelCard from "@/components/ui/ModelCard";
import VarianceAnalysis from "@/components/ui/VarianceAnalysis";


const imageLink = "/d.avif";
const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DeepAnalyticsDashboard() {
  const [mlpHistory, setMlpHistory] = useState<number[]>([]);
  const [xgbHistory, setXbHistory] = useState<number[]>([]);
  const [statusPipeline, setstatusPipeline] = useState(false);

  const { weatherData, status } = useSocketWeather({ url: backendPath ?? "" });

  const delta = weatherData
    ? Math.abs(weatherData.xgboostPrediction - weatherData.nnMlpPrediction)
    : 0;

  useEffect(() => {
    const checkPipelineStatus = async () => {
      try {
        const response = await fetch(`${backendPath}/api/v1/pipeline/status`);
        const data = await response.json();
        setstatusPipeline(data.is_running);
      } catch (error: any) {
        console.error(`Failed to fetch pipeline status: ${error.message}`);
      }
    };
    checkPipelineStatus();
  }, [backendPath]);

  useEffect(() => {
    if (weatherData) {
      setMlpHistory((prev) => [...prev.slice(-9), weatherData.nnMlpPrediction]);
      setXbHistory((prev) => [...prev.slice(-9), weatherData.xgboostPrediction]);
    }
  }, [weatherData]);

  const handleStartPipeline = async () => {
    try {
      console.log("🤖 Manually starting Kafka producer pipeline...");
      const response = await fetch(`${backendPath}/api/v1/pipeline/start`);
      if (response.ok) setstatusPipeline(true);
    } catch (error: any) {
      console.error(`Error starting pipeline: ${error.message}`);
    }
  };

  const handleStopPipeline = async () => {
    try {
      console.log("🛑 Manually terminating Kafka producer pipeline...");
      const response = await fetch(`${backendPath}/api/v1/pipeline/stop`);
      if (response.ok) setstatusPipeline(false);
    } catch (error: any) {
      console.error(`Error stopping pipeline: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Node Card */}
      <div className="relative text-white p-6 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 sm:bg-contain bg-cover transition-transform duration-1000"
          style={{ backgroundImage: `url('${imageLink}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-zinc-950/25 backdrop-blur-[1px]" aria-hidden="true" />

        <div className="relative z-20 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
                  Active Station: Tadla Alpha {status}
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                  statusPipeline 
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-950/40 text-rose-400 border-rose-500/20"
                }`}>
                  Pipeline: {statusPipeline ? "Online" : "Offline"}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
                Real Time Sensor Data
              </h1>
              
              {/* Manual Control Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleStartPipeline}
                  disabled={statusPipeline}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    statusPipeline
                      ? "bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md active:scale-95"
                  }`}
                >
                  🚀 Start Pipeline
                </button>
                <button
                  onClick={handleStopPipeline}
                  disabled={!statusPipeline}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    !statusPipeline
                      ? "bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md active:scale-95"
                  }`}
                >
                  🛑 Stop Pipeline
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-900 block">
                Last Synchronization
              </span>
              <span className="text-xl font-bold text-zinc-200">
                {weatherData ? weatherData.time : "17:26:03"}
              </span>
            </div>
          </div>

          <DescriptorGrid weatherData={weatherData} />
        </div>
      </div>

      {/* Analytics Model Execution Engine Grid Comparison Block */}
      <div className="grid grid-cols-1  lg:grid-cols-2 gap-8">
        <ModelCard
          modelTag="Deep Model A"
          modelName="Multi-Layer Perceptron (Inefficient for our Case)"
          tagClass="bg-violet-50 text-violet-700 border-violet-100"
          iconBgClass="bg-violet-50"
          iconColorClass="text-violet-600"
          valueColorClass="text-violet-600"
          predictionValue={weatherData?.nnMlpPrediction ?? 0}
          defaultValue="-"
          historyTitle="History of Neural Network MLP"
          history={mlpHistory}
          weatherData={weatherData}
          barColorClass="bg-violet-500 hover:bg-violet-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 114 0v2m6 0V5a2 2 0 10-4 0v2m0 0h4" />
            </svg>
          }
        />

        <ModelCard
          modelTag="Ensemble Model B"
          modelName="XGBoost Regressor"
          tagClass="bg-teal-50 text-teal-700 border-teal-100"
          iconBgClass="bg-teal-50"
          iconColorClass="text-teal-600"
          valueColorClass="text-teal-600"
          predictionValue={weatherData?.xgboostPrediction ?? 0}
          defaultValue="-"
          historyTitle="History of XGBoost"
          history={xgbHistory}
          weatherData={weatherData}
          barColorClass="bg-violet-500 hover:bg-violet-600" 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      <VarianceAnalysis delta={delta} />
    </div>
  );
}