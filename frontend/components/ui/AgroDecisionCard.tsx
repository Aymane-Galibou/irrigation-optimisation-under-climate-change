"use client";
import React from "react";

interface AgroDecisionCardProps {
  weatherData: any;
  onOpenIrrigateModal: () => void;
}

export default function AgroDecisionCard({
  weatherData,
  onOpenIrrigateModal,
}: AgroDecisionCardProps) {
  const currentDeficit = weatherData?.predictedDeficitMm ?? 0;
  const prevDeficit = weatherData?.prev_day_deficit_mm ?? 0;
  const delta = currentDeficit - prevDeficit;

  // Calculate irrigation volume per hectare (1 mm = 10 m³/ha)
  const cubicMetersPerHa = (currentDeficit * 10).toFixed(0);

  // Status Classifications
  let statusTier = {
    title: "Moisture Optimal",
    subtitle: "No irrigation needed today.",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    borderClass: "border-emerald-200",
    bgGradient: "from-emerald-50/50 to-white",
    icon: "🟢",
    actionRequired: false,
  };

  if (currentDeficit >= 30) {
    statusTier = {
      title: "Critical Water Stress",
      subtitle: "Immediate irrigation required to prevent yield loss.",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse",
      borderClass: "border-rose-300 shadow-md shadow-rose-100",
      bgGradient: "from-rose-50/60 to-white",
      icon: "🔴",
      actionRequired: true,
    };
  } else if (currentDeficit >= 15) {
    statusTier = {
      title: "Moderate Depletion",
      subtitle: "Soil moisture is declining. Plan irrigation within 24–48 hours.",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      borderClass: "border-amber-200",
      bgGradient: "from-amber-50/40 to-white",
      icon: "🟡",
      actionRequired: false,
    };
  }

  return (
    <div
      className={`bg-linear-to-b ${statusTier.bgGradient} rounded-2xl border ${statusTier.borderClass} p-6 shadow-sm flex flex-col justify-between space-y-6`}
    >
      {/* Header & Status Badge */}
      <div>
        <div className="flex justify-between items-start gap-2">
          <div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 w-fit ${statusTier.badgeClass}`}
            >
              <span>{statusTier.icon}</span>
              <span className="uppercase tracking-wider">{statusTier.title}</span>
            </span>
            <h3 className="text-xl font-black text-zinc-900 mt-2">
              Action Recommendation
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Crop: <strong className="text-zinc-700">{weatherData?.feature_crop ?? "Maize"}</strong>
          </span>
        </div>

        <p className="text-sm text-zinc-600 mt-2 font-medium">
          {statusTier.subtitle}
        </p>
      </div>

      {/* Evolving Deficit Comparison */}
      <div className="grid grid-cols-2 gap-3 bg-white/80 p-4 rounded-xl border border-zinc-200/80 backdrop-blur-sm">
        <div>
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Daily Evolution
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-zinc-800 font-mono">
              {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} mm
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              {delta > 0 ? "↗ (drying)" : "↘ (moistening)"}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Water Volume Needed
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-blue-600 font-mono">
              {cubicMetersPerHa}
            </span>
            <span className="text-xs font-bold text-zinc-500">m³/ha</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <button
          onClick={onOpenIrrigateModal}
          className={`w-full py-3 px-4 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 ${
            statusTier.actionRequired
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 active:scale-95"
              : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
          }`}
        >
          <span>💧</span>
          <span>
            {statusTier.actionRequired
              ? "Execute Irrigation & Reset Deficit"
              : "Log Irrigation Event"}
          </span>
        </button>
      </div>
    </div>
  );
}