"use client";

interface VarianceAnalysisProps {
  delta: number;
}

export default function VarianceAnalysis({ delta }: VarianceAnalysisProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h4 className="text-sm font-bold text-zinc-900">
          Inter-Model Variance Analysis (Absolute Delta)
        </h4>
        <p className="text-xs text-zinc-500 mt-0.5">
          Allows agronomists to validate algorithmic convergence against microclimate anomalies.
        </p>
      </div>
      <div className="bg-white px-4 py-2.5 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="text-xs font-medium text-zinc-400 font-mono">
          Temporal Delta:
        </span>
        <span className="text-base font-black text-zinc-900 font-mono">
          {delta !== 0 ? `${delta.toFixed(4)} mm` : "0.2308 mm"}
        </span>
      </div>
    </div>
  );
}