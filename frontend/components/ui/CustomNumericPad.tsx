"use client";

interface NumericPadProps {
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  activeFieldName: string;
}

export default function CustomNumericPad({
  onKeyPress,
  onDelete,
  onClear,
  activeFieldName,
}: NumericPadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."];

  return (
    <div className="bg-zinc-100 p-4 rounded-2xl border border-zinc-200 space-y-3 shadow-inner">
      <div className="text-center">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Input Active : {activeFieldName || "Select a Field"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={!activeFieldName}
            onClick={() => onKeyPress(digit)}
            className="h-14 bg-white active:bg-zinc-200 disabled:opacity-50 border border-zinc-200 rounded-xl font-mono text-lg font-bold text-zinc-800 transition-colors shadow-sm cursor-pointer select-none flex items-center justify-center"
          >
            {digit}
          </button>
        ))}

        {/* Delete button */}
        <button
          type="button"
          disabled={!activeFieldName}
          onClick={onDelete}
          className="h-14 bg-amber-50 active:bg-amber-100 disabled:opacity-50 border border-amber-200 rounded-xl text-sm font-bold text-amber-700 transition-colors shadow-sm cursor-pointer select-none flex items-center justify-center"
        >
          ⌫
        </button>
      </div>

      {/* Clear button */}
      <button
        type="button"
        disabled={!activeFieldName}
        onClick={onClear}
        className="w-full h-10 bg-red-50 active:bg-red-100 disabled:opacity-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 transition-colors shadow-sm cursor-pointer select-none flex items-center justify-center"
      >
        Clean 
      </button>
    </div>
  );
}