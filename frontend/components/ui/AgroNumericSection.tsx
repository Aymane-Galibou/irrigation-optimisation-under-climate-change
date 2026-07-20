"use client";

import { useState } from "react";
import { numericalInputs } from "@/data/manualSimulations";
import CustomNumericPad from "./CustomNumericPad";

interface AgroNumericSectionProps {
  initialValues: Record<string, number | string>;
}

export default function AgroNumericSection({ initialValues }: AgroNumericSectionProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const stringMapping: Record<string, string> = {};
    Object.keys(initialValues).forEach((key) => {
      stringMapping[key] = initialValues[key].toString();
    });
    return stringMapping;
  });

  const [activeField, setActiveField] = useState<string>("tmax");

  const handleKeyPress = (char: string) => {
    if (!activeField) return;

    setValues((prev) => {
      const currentVal = prev[activeField] || "";
      // Prevent multiple decimals
      if (char === "." && currentVal.includes(".")) return prev;
      return { ...prev, [activeField]: currentVal + char };
    });
  };

  const handleDelete = () => {
    if (!activeField) return;
    setValues((prev) => ({
      ...prev,
      [activeField]: (prev[activeField] || "").slice(0, -1),
    }));
  };

  const handleClear = () => {
    if (!activeField) return;
    setValues((prev) => ({ ...prev, [activeField]: "" }));
  };

  const getActiveTitle = (): string => {
    const inputConfig = numericalInputs.find((p) => p.name === activeField);
    return inputConfig ? inputConfig.title : "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Visual Input Selection Grid */}
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {numericalInputs.map((p) => {
          const isActive = activeField === p.name;
          const rawValue = values[p.name] || "0";

          return (
            <div
              key={p.name}
              onClick={() => setActiveField(p.name)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 select-none ${
                isActive
                  ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm"
              }`}
            >
              <span className="text-xs font-bold text-zinc-500 block leading-tight">
                {p.title}
              </span>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-mono font-black text-zinc-900 truncate">
                  {rawValue === "" ? "0" : rawValue}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">
                  {p.unit}
                </span>
              </div>

              {/* Hidden HTML input tags to perfectly link with Next.js Server Actions FormData */}
              <input 
                type="hidden" 
                name={p.name} 
                value={parseFloat(rawValue) || 0} 
              />
            </div>
          );
        })}
      </div>

      {/* Numeric Pad Side Column */}
      <div className="lg:col-span-2">
        <CustomNumericPad
          activeFieldName={getActiveTitle()}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}