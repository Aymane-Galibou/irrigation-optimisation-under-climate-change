'use client';
import useSocketWeather from '@/hooks/useSocketWeather';
import { useEffect, useState } from 'react';

const imageLink = '/d.avif'
const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL;



export default function DeepAnalyticsDashboard() {
  // const [mlpHistory, setMlpHistory] = useState<number[]>([]);
  // const [xgbHistory, setXbHistory] = useState<number[]>([]);

  const {weatherData,status} = useSocketWeather({url:backendPath ?? ""})
  
// calculating delta (fer9 bin xgboost & NN )  
  const delta = weatherData ? Math.abs(weatherData.xgboostPrediction - weatherData.nnMlpPrediction) : 0;

  return (
    <div className="space-y-8">
      
<div className="relative text-white p-6 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden bg-zinc-950">
  <div 
    className="absolute inset-0 sm:bg-contain bg-cover transition-transform duration-1000"
    style={{ backgroundImage: `url('${imageLink}')` }}
    aria-hidden="true"
  />

  <div className="absolute inset-0 bg-zinc-950/25 backdrop-blur-[1px]" aria-hidden="true" />


  
  <div className="relative z-20 space-y-6">
    
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
          Station Active: Taroudant Alpha {status}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2 drop-shadow-md">
          Matrice Globale des Descripteurs (Inputs)
        </h1>
      </div>
      <div className="text-right">
        <span className="text-xs font-bold text-zinc-900 block">Dernière synchronisation</span>
        <span className="text-xl font-bold text-zinc-200">{weatherData ? weatherData.time : "17:26:03"}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-white/10">
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Culture / Type</span>
        <span className="text-sm font-bold text-white">{weatherData?.weather.feature_crop ? weatherData?.weather.feature_crop : "Maïs (Generic)"}</span>
      </div>
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Stade de Croissance</span>
        <span className="text-sm font-bold text-emerald-400">{weatherData?.weather ? `Jour ${weatherData.weather.dap} (DAP)` : "Jour 45"}</span>
      </div>
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Température Max</span>
        <span className="text-sm font-bold text-white">{weatherData?.weather ? `${weatherData?.weather.tmax.toFixed(1)} °C` : "34.5 °C"}</span>
      </div>
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Rayonnement (SRAD)</span>
        <span className="text-sm font-bold text-white">{weatherData?.weather ? `${weatherData?.weather.srad.toFixed(1)} MJ/m²` : "26.4 MJ/m²"}</span>
      </div>
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Précipitations (Rain)</span>
        <span className={`text-sm font-bold ${weatherData?.weather && weatherData.weather.rain > 0 ? 'text-blue-400' : 'text-zinc-300'}`}>
          {weatherData?.weather ? `${weatherData.weather.rain.toFixed(1)} mm` : "0.0 mm"}
        </span>
      </div>
      
      <div className="bg-zinc-500/20 backdrop-blur-md p-3 rounded-xl border border-white/5">
        <span className="text-[11px] text-zinc-400 block font-medium">Déficit Veille</span>
        <span className="text-sm font-bold text-zinc-200">{weatherData?.weather ? `${weatherData.weather.prev_day_deficit_mm.toFixed(1)} mm` : "12.3 mm"}</span>
      </div>

    </div>
  </div>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-violet-50 text-violet-700 rounded-md border border-violet-100 uppercase">
                  Modèle Profond A
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-1">Multi-Layer Perceptron (PyTorch)</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 114 0v2m6 0V5a2 2 0 10-4 0v2m0 0h4" /></svg>
              </div>
            </div>

            <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-baseline justify-between">
              <span className="text-xs text-zinc-400 font-medium">Besoin d'irrigation calculé (SWTD) :</span>
              <div className="text-right">
                <span className="text-3xl font-black text-violet-600 font-mono tracking-tight">
                  {weatherData ? weatherData.nnMlpPrediction.toFixed(4) : "14.2150"}
                </span>
                <span className="text-xs font-bold text-zinc-500 ml-1">mm</span>
              </div>
            </div>
          </div>

          {/* <div className="px-6 pb-6 mt-4">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">Historique de file d'inférence (MLP)</span>
            <div className="flex items-end gap-1.5 h-16 pt-2 border-b border-zinc-100">
              {mlpHistory.map((val, i) => (
                <div key={i} className="flex-1 bg-violet-500 hover:bg-violet-600 rounded-t relative group transition-all" style={{ height: `${Math.min(val * 5, 100)}%` }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
                    {val.toFixed(2)} mm
                  </span>
                </div>
              ))}
            </div>
          </div> */}

        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 rounded-md border border-teal-100 uppercase">
                  Modèle Ensembliste B
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-1">XGBoost Regressor</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>

            <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-baseline justify-between">
              <span className="text-xs text-zinc-400 font-medium">Besoin d'irrigation calculé (SWTD) :</span>
              <div className="text-right">
                <span className="text-3xl font-black text-teal-600 font-mono tracking-tight">
                  {weatherData ? weatherData.nnMlpPrediction.toFixed(4) : "13.9842"}
                </span>
                <span className="text-xs font-bold text-zinc-500 ml-1">mm</span>
              </div>
            </div>
          </div>

          {/* <div className="px-6 pb-6 mt-4">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">Historique de file d'inférence (XGBoost)</span>
            <div className="flex items-end gap-1.5 h-16 pt-2 border-b border-zinc-100">
              {xgbHistory.map((val, i) => (
                <div key={i} className="flex-1 bg-teal-500 hover:bg-teal-600 rounded-t relative group transition-all" style={{ height: `${Math.min(val * 5, 100)}%` }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
                    {val.toFixed(2)} mm
                  </span>
                </div>
              ))}
            </div>
          </div> */}

        </div>

      </div>

      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Analyse de Variance Inter-Modèles (Ecart Absolu)</h4>
          <p className="text-xs text-zinc-500 mt-0.5">Permet aux ingénieurs agronomes de valider la convergence algorithmique face aux anomalies du microclimat.</p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-xs font-medium text-zinc-400 font-mono">Delta Temporel:</span>
          <span className="text-base font-black text-zinc-900 font-mono">
            {delta !== 0 ? `${delta.toFixed(4)} mm` : "0.2308 mm"}
          </span>
        </div>
      </div>

    </div>
  );
}