"use client";

import { useEffect, useState, useCallback } from "react";
import useSocketWeather from "@/hooks/useSocketWeather";
import DescriptorGrid from "@/components/ui/DescriptorGrid";
import ModelCard from "@/components/ui/ModelCard";
import AgroDecisionCard from "@/components/ui/AgroDecisionCard";
import IrrigationPopUp from "@/components/ui/IrrigationPopUp";
import IrrigationAlertToast from "@/components/ui/IrrigationToast";

const CRITICAL_THRESHOLD_MM = 25;
const imageLink = "/d.avif";
const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function DeepAnalyticsDashboard() {
  // State Management
  const [xgbHistory, setXbHistory] = useState<number[]>([]);
  const [statusPipeline, setStatusPipeline] = useState(false);
  const [isIrrigating, setIsIrrigating] = useState(false);
  
  // Alert & Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoAlertOpen, setIsAutoAlertOpen] = useState(false);
  const [hasSnoozed, setHasSnoozed] = useState(false);
  const [dismissedAtDeficit, setDismissedAtDeficit] = useState<number | null>(null);

  // Real time Socket Connection
  const { weatherData, status } = useSocketWeather({ url: backendPath });
  const currentDeficit = weatherData?.predictedDeficitMm ?? 0;

  // Fetch initial pipeline status
  useEffect(() => {
    if (!backendPath) return;

    const checkPipelineStatus = async () => {
      try {
        const response = await fetch(`${backendPath}/api/v1/pipeline/status`);
        if (response.ok) {
          const data = await response.json();
          setStatusPipeline(data.is_running);
        }
      } catch (error: any) {
        console.error(`Failed to fetch pipeline status: ${error.message}`);
      }
    };

    checkPipelineStatus();
  }, []);

  // Track real time prediction history buffer for chart rendering
  useEffect(() => {
    if (weatherData?.predictedDeficitMm !== undefined) {
      setXbHistory((prev) => [...prev.slice(-9), weatherData.predictedDeficitMm]);
    }
  }, [weatherData]);

  
  // Monitor water stress deficit threshold for auto toast warning
 useEffect(() => {
  if (weatherData?.predictedDeficitMm !== undefined) {
    const deficit = weatherData.predictedDeficitMm;

    // Reset dismiss state if soil moisture recovers below safety limit
    if (deficit < CRITICAL_THRESHOLD_MM) {
      setIsAutoAlertOpen(false);
      setDismissedAtDeficit(null);
      return;
    }

    // Trigger if critical AND deficit has worsened past the last dismissed value
    if (deficit >= CRITICAL_THRESHOLD_MM) {
      if (dismissedAtDeficit === null || deficit > dismissedAtDeficit) {
        setIsAutoAlertOpen(true);
      }
    }
  }
}, [weatherData, dismissedAtDeficit]);

  // Pipeline Controls
  const handleStartPipeline = async () => {
    try {
      const response = await fetch(`${backendPath}/api/v1/pipeline/start`);
      if (response.ok) setStatusPipeline(true);
    } catch (error: any) {
      console.error(`Error starting pipeline: ${error.message}`);
    }
  };

  const handleStopPipeline = async () => {
    try {
      const response = await fetch(`${backendPath}/api/v1/pipeline/stop`);
      if (response.ok) setStatusPipeline(false);
    } catch (error: any) {
      console.error(`Error stopping pipeline: ${error.message}`);
    }
  };

  // Irrigation Action (Resets deficit in FastAPI state)
  const handleIrrigate = useCallback(async () => {
    try {
      setIsIrrigating(true);
      const response = await fetch(`${backendPath}/api/v1/irrigate`, { method: "POST" });
      
      if (response.ok) {
        setIsModalOpen(false);
        setIsAutoAlertOpen(false);
        setHasSnoozed(false); // Reset snooze so future alerts fire when deficit builds up again
      }
    } catch (error: any) {
      console.error(`Error executing irrigation reset: ${error.message}`);
    } finally {
      setIsIrrigating(false);
    }
  }, []);

const handleDismissToast = () => {
  setIsAutoAlertOpen(false);
  setDismissedAtDeficit(currentDeficit); 
};
  return (
    <div className="space-y-8 relative">
      {/* 1. Manual Action Confirmation Modal */}
      <IrrigationPopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmIrrigation={handleIrrigate}
        isIrrigating={isIrrigating}
        weatherData={weatherData}
      />

      {/* 2. Top Station Header & Environmental Descriptor Grid */}
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
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active Station: Tadla Alpha ({status})
                </span>
                
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                    statusPipeline
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-950/40 text-rose-400 border-rose-500/20"
                  }`}
                >
                  Pipeline: {statusPipeline ? "Online" : "Offline"}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
                Real Time Agrometeorological Platform
              </h1>

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
              <span className="text-xs font-bold text-zinc-400 block">
                Last Synchronization
              </span>
              <span className="text-xl font-bold text-zinc-200 font-mono">
                {weatherData ? weatherData.time : "--:--:--"}
              </span>
            </div>
          </div>

          {/* Keeps raw weather parameters organized at the top */}
          <DescriptorGrid weatherData={weatherData} />
        </div>
      </div>

      {/* 3. Main Decision Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Humanized Model Card */}
        <ModelCard
          modelTag="Smart Moisture AI"
          modelName="Predicted Soil Water Deficit"
          tagClass="bg-teal-50 text-teal-700 border-teal-100"
          iconBgClass="bg-teal-50"
          iconColorClass="text-teal-600"
          valueColorClass="text-teal-600"
          predictionValue={currentDeficit}
          defaultValue="-"
          historyTitle="Recent Soil Moisture Trend"
          history={xgbHistory}
          weatherData={weatherData}
          barColorClass="bg-teal-500 hover:bg-teal-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        {/* Dynamic Action Recommendation & Status Card */}
        <AgroDecisionCard
          weatherData={weatherData}
          onOpenIrrigateModal={() => setIsModalOpen(true)}
        />
      </div>

      {/* 4. Automated Floating Toast Banner (Positioned outside Grid) */}
      <IrrigationAlertToast
        isOpen={isAutoAlertOpen}
        onClose={handleDismissToast}
        onConfirmIrrigation={handleIrrigate}
        isIrrigating={isIrrigating}
        weatherData={weatherData}
        thresholdMm={CRITICAL_THRESHOLD_MM}
      />
    </div>
  );
}