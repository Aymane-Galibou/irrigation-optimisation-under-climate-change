"use client";
import React from "react";

interface IrrigationAlertToastProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmIrrigation: () => Promise<void>;
  isIrrigating: boolean;
  weatherData: any;
  thresholdMm?: number;
}

export default function IrrigationAlertToast({
  isOpen,
  onClose,
  onConfirmIrrigation,
  isIrrigating,
  weatherData,
  thresholdMm = 30,
}: IrrigationAlertToastProps) {
  if (!isOpen) return null;

  const currentDeficit = weatherData?.predictedDeficitMm ?? 0;
  const volumeNeeded = (currentDeficit * 10).toFixed(0);
  const cropName = weatherData?.feature_crop ?? "Crop";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 sm:px-0 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-400/80 shadow-2xl shadow-amber-900/15 overflow-hidden">
        
        {/* Top Warning Ribbon */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-rose-700 px-4 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Irrigation Required Alert
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Snooze warning"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toast Body */}
        <div className="p-4 space-y-3">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                Soil Moisture Depleted past {thresholdMm} mm
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Station: <strong className="text-stone-700">Tadla Alpha</strong> • Crop:{" "}
                <strong className="text-stone-700 capitalize">{cropName}</strong>
              </p>
            </div>
            <span className="text-2xl shrink-0">🌾</span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Current Deficit
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-amber-950 font-mono">
                  {currentDeficit.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-amber-700">mm</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Target Volume
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {volumeNeeded}
                </span>
                <span className="text-xs font-bold text-emerald-700">m³/ha</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Dismiss
            </button>

            <button
              onClick={onConfirmIrrigation}
              disabled={isIrrigating}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-900/10 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {isIrrigating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <span>💧</span>
                  <span>Confirm Irrigation</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}