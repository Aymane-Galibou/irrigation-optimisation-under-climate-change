"use client";

interface HistoryBarChartProps {
  history: number[];
  barColorClass?: string;
}

export default function HistoryBarChart({ 
  history, 
  barColorClass = "bg-violet-500 hover:bg-violet-600" 
}: HistoryBarChartProps) {
  return (
    <div className="flex items-end justify-between gap-1.5 h-16 pt-2 border-b border-zinc-100">
      {Array.from({ length: 10 }).map((_, i) => {
        const val = history[history.length - 10 + i];
        const hasValue = typeof val === "number" && !isNaN(val);
        const barHeight = hasValue ? Math.max(6, Math.min(val * 5, 100)) : 6;

        return (
          <div
            key={i}
            className={`flex-1 rounded-t relative group transition-all duration-300 ${
              hasValue ? `${barColorClass} cursor-pointer` : "bg-zinc-100"
            }`}
            style={{ height: `${barHeight}%` }}
          >
            {hasValue && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono shadow-md">
                {val.toFixed(2)} mm
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}