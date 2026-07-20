"use client";

import simulatePredictionAction from "@/components/features/simulatePrediction";
import AgroNumericSection from "@/components/ui/AgroNumericSection";
import { categoricalInputs } from "@/data/manualSimulations";
import { FormState } from "@/interfaces/manualSimulationInterface";
import { useActionState } from "react";

const baseState: FormState = {
  success: false,
  message: "",
  errors: null,
  prediction: null,
};

const INITIAL_FORM_VALUES = {
  feature_crop: "Maize",
  feature_soil: "Brun_Calcaire_Silt_Loam",
  feature_year: 2026,
  DAP: 45,
  DOY: 172,
  tmin: 16.0,
  tmax: 32.0,
  srad: 25.0,
  rain: 0.0,
  prev_day_deficit_mm: 10.0,
};

export default function ManualPrediction() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    simulatePredictionAction,
    baseState,
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Agronomic Inference Simulator
        </h1>
        <p className="text-sm text-zinc-500">
          Field-optimized touch interface. Select a card below to modify its
          numeric value using the keypad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Input Form Handling */}
        <form action={formAction} className="md:col-span-2 space-y-6">
          {/* Categorical Dropdowns */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4">
            {categoricalInputs.map((e) => (
              <div key={e.name}>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">
                  {e.title}
                </label>
                <select
                  defaultValue={
                    INITIAL_FORM_VALUES[
                      e.name as keyof typeof INITIAL_FORM_VALUES
                    ] ?? ""
                  }
                  name={e.name}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm font-semibold text-zinc-700 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {e.selectItems.map((child) => (
                    <option key={child.value} value={child.value}>
                      {child.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Integrated Dynamic Custom Numeric Section */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
              Environmental Measures & Climate
            </h2>
            <AgroNumericSection initialValues={INITIAL_FORM_VALUES} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed select-none active:scale-[0.99]"
          >
            {isPending ? "Calculating Inference..." : "Calculate Water Needs"}
          </button>
        </form>

        {/* Inference Status Dashboard Output */}
        <div className="bg-zinc-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-xl min-h-85 sticky top-6">
          <div>
            <h3 className="font-bold text-base mb-2">Model Verdict</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The injected physical parameters are instantly processed and
              evaluated by the predictive machine learning model.
            </p>
          </div>

          <div className="my-8 text-center">
            {state.prediction !== null ? (
              <div className="space-y-1">
                <div className="text-5xl font-extrabold text-emerald-400 tracking-tight font-mono">
                  {state.prediction.toFixed(4)}
                </div>
                <div className="text-xs text-emerald-500/80 font-bold uppercase tracking-widest text-[10px]">
                  mm of water deficit (SWTD)
                </div>
              </div>
            ) : state.errors ? (
              <div className="text-xs text-red-400 font-medium p-3 bg-red-950/40 rounded-xl border border-red-900/30">
                {state.errors}
              </div>
            ) : (
              <div className="text-sm text-zinc-500 italic">
                Awaiting climate data submission...
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-zinc-800 pt-3 flex items-center gap-2 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
            />
            Engine Status:{" "}
            {isPending ? "Calculation in progress" : "Ready for analysis"}
          </div>
        </div>
      </div>
    </div>
  );
}
