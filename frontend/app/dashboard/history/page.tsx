"use client";
import { weatherType } from "@/interfaces/weatherInterface";
import React, { useEffect, useState } from "react";

const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HistoryPage() {
  const [history, sethistory] = useState<weatherType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${backendPath}/api/v1/history`);

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        // S'adapte si votre API renvoie directement un tableau ou enveloppé dans un objet .data
        sethistory(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        console.error("Échec de la récupération de l'historique :", err);
        setError(err.message || "Impossible de récupérer les données.");
      } finally {
        setIsLoading(false);
      }
    };

    getHistory();
  }, []);

  // Calculs rapides pour les indicateurs clés (KPIs)
  const totalRecords = history.length;
  const avgRain = totalRecords
    ? (
        history.reduce((sum, item) => sum + (item.rain || 0), 0) / totalRecords
      ).toFixed(1)
    : "0.0";
  const uniqueCrops = Array.from(new Set(history.map((h) => h.feature_crop)))
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Data History{" "}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Visualize & analyse the agriculture dataset
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-zinc-400 font-mono">
            {totalRecords} Records Sychronized
          </span>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            Total Records{" "}
          </span>
          <span className="text-3xl font-black text-white mt-2 block font-mono">
            {totalRecords}
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            Precipitation Average
          </span>
          <span className="text-3xl font-black text-blue-400 mt-2 block font-mono">
            {avgRain}{" "}
            <span className="text-sm font-normal text-zinc-500">mm</span>
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            Crop Type
          </span>
          <span className="text-lg font-bold text-emerald-400 mt-3 block truncate">
            {uniqueCrops || "Aucune donnée"}
          </span>
        </div>
      </div>

      {/* Main Section (loading , data, error if exists) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          /* loading  */
          <div className="p-10 space-y-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
            <p className="text-zinc-400 text-sm">Loading data history...</p>
          </div>
        ) : error ? (
          /* error message*/
          <div className="p-10 text-center space-y-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-zinc-500 text-xs">
              Please check The backend server
            </p>
          </div>
        ) : history.length === 0 ? (
          /* Liste vide */
          <div className="p-10 text-center text-zinc-500">
            No records founded in database
          </div>
        ) : (
          /* data table*/
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Time</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Soil</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">DAP (Day)</th>
                  <th className="p-4">T. Max / Min</th>
                  <th className="p-4">Rayonnement</th>
                  <th className="p-4">Rain</th>
                  <th className="p-4">Previous Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {history.map((record, index) => (
                  <tr
                    key={index}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4">
                      {record._time ? (
                        <div className="flex flex-col">
                          {/* Date: e.g., 16/07/2026 */}
                          <span className="font-semibold text-zinc-100 font-mono text-sm">
                            {new Date(record._time).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {/* Time: e.g., 17:29:53 */}
                          <span className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            {new Date(record._time).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 font-mono text-xs">
                          --/--/----
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {record.feature_crop || "Maïs (Generic)"}
                    </td>
                    <td className="p-4 text-zinc-300 font-mono">
                      {record.feature_soil || "N/A"}
                    </td>
                    <td className="p-4 text-zinc-400 font-mono">
                      {record.feature_year}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-xs font-mono">
                        Jour {record.DAP}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-200 font-mono">
                      {record.tmax?.toFixed(1)}°C / {record.tmin?.toFixed(1)}°C
                    </td>
                    <td className="p-4 text-zinc-400 font-mono">
                      {record.srad?.toFixed(1)}{" "}
                      <span className="text-[10px] text-zinc-600">MJ/m²</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-mono font-bold ${record.rain > 0 ? "text-blue-400" : "text-zinc-500"}`}
                      >
                        {record.rain?.toFixed(1)} mm
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono">
                      {record.prev_day_deficit_mm?.toFixed(1)} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
