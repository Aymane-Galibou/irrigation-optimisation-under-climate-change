"use client";
import React from "react";

interface IrrigationPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmIrrigation: () => Promise<void>;
  isIrrigating: boolean;
  weatherData: any;
}

export default function IrrigationPopUp({
  isOpen,
  onClose,
  onConfirmIrrigation,
  isIrrigating,
  weatherData,
}: IrrigationPopUpProps) {
  if (!isOpen) return null;

  const currentDeficit = weatherData?.predictedDeficitMm ?? 0;
  const volumeNeeded = (currentDeficit * 10).toFixed(0);
  const cropName = weatherData?.feature_crop ?? "Crop";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-emerald-100 shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Header: Warm, trustworthy agricultural tone */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/15">
              🌱
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 tracking-wider uppercase block">
                Field Action Confirmation
              </span>
              <h3 className="font-extrabold text-lg leading-tight text-emerald-50">
                Log Irrigation Event
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-emerald-200/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body: De-nested layout with clear visual hierarchy */}
        <div className="p-6 space-y-5">
          
          {/* Main Agronomic Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/60 border border-emerald-100/80 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-800/70 uppercase tracking-wider block mb-1">
                Water Stress
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
                  {currentDeficit.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-emerald-700">mm</span>
              </div>
            </div>

            <div className="bg-sky-50/60 border border-sky-100/80 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-sky-800/70 uppercase tracking-wider block mb-1">
                Target Volume
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-sky-950 font-mono tracking-tight">
                  {volumeNeeded}
                </span>
                <span className="text-xs font-bold text-sky-700">m³/ha</span>
              </div>
            </div>
          </div>

          {/* Humanized Explanation */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Station: <strong className="text-stone-900">Tadla Alpha</strong></span>
              <span className="text-stone-300">•</span>
              <span>Crop: <strong className="text-stone-900 capitalize">{cropName}</strong></span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Confirming this action registers a full watering session for this field. The system will reset the accumulated water deficit to zero and recalculate upcoming moisture needs from this baseline.
            </p>
          </div>

        </div>

        {/* Action Footer: Friendly buttons with feedback states */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded-xl transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirmIrrigation}
            disabled={isIrrigating}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-900/10 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isIrrigating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Field State...</span>
              </>
            ) : (
              <>
                <span>💧</span>
                <span>Confirm & Reset Deficit</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}