// app/dashboard/manual/page.tsx
'use client';
import { useState } from 'react';

export default function ManualPrediction() {
  const [formData, setFormData] = useState({
    feature_crop: 'Maize',
    feature_soil: 'Brun_Calcaire_Silt_Loam',
    feature_year: 2026,
    DAP: 45,
    DOY: 172,
    tmin: 16.0,
    tmax: 32.0,
    srad: 25.0,
    rain: 0.0,
    prev_day_deficit_mm: 10.0,
  });

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/predict-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data.SWTD_deficit_mm);
    } catch (error) {
      console.error("Erreur lors de l'inférence manuelle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Simulateur d'Inférence Agronomique</h1>
        <p className="text-sm text-zinc-500">Injectez manuellement vos scénarios climatiques pour interroger le réseau de neurones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Culture</label>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.feature_crop} onChange={e => setFormData({...formData, feature_crop: e.target.value})}>
                <option value="Maize">Maïs (Generic)</option>
                <option value="Tomato">Tomates</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Type de Sol</label>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.feature_soil} onChange={e => setFormData({...formData, feature_soil: e.target.value})}>
                <option value="Brun_Calcaire_Silt_Loam">Brun Calcaire / Silt Loam</option>
                <option value="Argilo_Sableux">Argilo-Sableux</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">DAP</label>
              <input type="number" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.DAP} onChange={e => setFormData({...formData, DAP: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">DOY</label>
              <input type="number" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.DOY} onChange={e => setFormData({...formData, DOY: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Déficit Précédent (mm)</label>
              <input type="number" step="0.1" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.prev_day_deficit_mm} onChange={e => setFormData({...formData, prev_day_deficit_mm: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Tmin (°C)</label>
              <input type="number" step="0.1" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.tmin} onChange={e => setFormData({...formData, tmin: parseFloat(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Tmax (°C)</label>
              <input type="number" step="0.1" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm" value={formData.tmax} onChange={e => setFormData({...formData, tmax: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
            {loading ? "Calcul de l'Inférence..." : "Calculer le besoin en eau"}
          </button>
        </form>

        {/* Panneau de Affichage du résultat */}
        <div className="bg-zinc-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="font-bold text-base mb-2">Verdict du Modèle</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Les données transmises passent à travers le OneHotEncoder et le tenseur PyTorch en temps réel.</p>
          </div>

          <div className="my-8 text-center">
            {result !== null ? (
              <div className="space-y-1">
                <div className="text-5xl font-extrabold text-emerald-400 tracking-tight">{result.toFixed(4)}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">mm de déficit (SWTD)</div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500 italic">Formulaire en attente de soumission...</div>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-zinc-800 pt-3">
            Statut moteur : Opérationnel
          </div>
        </div>
      </div>
    </div>
  );
}