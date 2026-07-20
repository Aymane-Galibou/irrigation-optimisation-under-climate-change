"use client";
import { ModelCardProps } from "@/interfaces/weatherInterface";
import HistoryBarChart from "./HistoryBarchart";

export default function ModelCard({
  modelTag,
  modelName,
  tagClass,
  iconBgClass,
  iconColorClass,
  valueColorClass,
  predictionValue,
  defaultValue,
  historyTitle,
  history,
  barColorClass,
  weatherData,
  icon,
}: ModelCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border uppercase ${tagClass}`}
            >
              {modelTag}
            </span>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">
              {modelName}
            </h3>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass} ${iconColorClass}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-baseline justify-between">
          <span className="text-xs text-zinc-400 font-medium">
            Calculated Irrigation Demand (SWTD):
          </span>
          <div className="text-right">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${valueColorClass}`}
            >
              {weatherData ? predictionValue.toFixed(4) : defaultValue}
            </span>
            <span className="text-xs font-bold text-zinc-500 ml-1">mm</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 mt-4">
        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">
          {historyTitle}
        </span>
        <HistoryBarChart history={history} barColorClass={barColorClass} />
      </div>
    </div>
  );
}
