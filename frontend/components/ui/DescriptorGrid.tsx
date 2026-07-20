"use client";

interface DescriptorGridProps {
  weatherData: any;
}

export default function DescriptorGrid({ weatherData }: DescriptorGridProps) {
  const inputDescriptors = [
    {
      label: "Crop / Type",
      value: weatherData?.weather.feature_crop ?? "Maize (Generic)",
      className: "text-white",
    },
    {
      label: "Growth Stage",
      value: weatherData?.weather ? `Day ${weatherData.weather.DAP} (DAP)` : "Day 45",
      className: "text-emerald-400",
    },
    {
      label: "Max Temperature",
      value: weatherData?.weather ? `${weatherData.weather.tmax.toFixed(1)} °C` : "34.5 °C",
      className: "text-white",
    },
    {
      label: "Radiation (SRAD)",
      value: weatherData?.weather ? `${weatherData.weather.srad.toFixed(1)} MJ/m²` : "26.4 MJ/m²",
      className: "text-white",
    },
    {
      label: "Precipitation (Rain)",
      value: weatherData?.weather ? `${weatherData.weather.rain.toFixed(1)} mm` : "0.0 mm",
      className: weatherData?.weather && weatherData.weather.rain > 0 ? "text-blue-400" : "text-zinc-300",
    },
    {
      label: "Previous Day Deficit",
      value: weatherData?.weather ? `${weatherData.weather.prev_day_deficit_mm.toFixed(1)} mm` : "12.3 mm",
      className: "text-zinc-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-white/10">
      {inputDescriptors.map((descriptor, idx) => (
        <div key={idx} className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
          <span className="text-[11px] text-zinc-400 block font-medium">
            {descriptor.label}
          </span>
          <span className={`text-sm font-bold ${descriptor.className}`}>
            {descriptor.value}
          </span>
        </div>
      ))}
    </div>
  );
}