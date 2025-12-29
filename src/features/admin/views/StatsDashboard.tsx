import { useState, useMemo } from "react";

// --- MOCK DATA GENERATOR FOR STATS ---
// On génère des données sur l'année pour avoir de beaux graphiques
const generateYearlyData = () => {
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return months.map((month) => {
    // Random revenu entre 2000 et 8000€
    const revenue = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;
    // Random remplissage entre 40% et 95%
    const occupancy = Math.floor(Math.random() * (95 - 40 + 1)) + 40;
    return { month, revenue, occupancy };
  });
};

export default function StatsDashboard() {
  const [view, setView] = useState<"day" | "week" | "month" | "year">("year");

  // Utilisation de useMemo pour ne pas recalculer à chaque render
  const data = useMemo(() => generateYearlyData(), []);

  // Calcul des TOTAUX
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgOccupancy = Math.round(
    data.reduce((acc, curr) => acc + curr.occupancy, 0) / data.length
  );
  const totalBookings = Math.round(totalRevenue / 28); // Estimation (prix moyen 28€)

  // Fonction pour déterminer la hauteur de la barre (max 200px)
  const getMaxRevenue = Math.max(...data.map((d) => d.revenue));
  const getBarHeight = (value: number) => `${(value / getMaxRevenue) * 100}%`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* FILTRES (Onglets Visuels) */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-slate-800">
          Performance du Club
        </h2>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex gap-1">
          {["day", "week", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  view === v
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              {v === "day"
                ? "Jour"
                : v === "week"
                ? "Semaine"
                : v === "month"
                ? "Mois"
                : "Année"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS (Chiffres Clés) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* CA TOTAL */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Chiffre d'Affaires
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {totalRevenue.toLocaleString()}€
            </p>
            <p className="text-xs text-green-600 font-medium flex items-center">
              ▲ +12% <span className="text-slate-400 ml-1">vs année N-1</span>
            </p>
          </div>
        </div>

        {/* TAUX REMPLISSAGE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
            📊
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-xs font-bold uppercase">
              Taux de Remplissage
            </p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {avgOccupancy}%
              </p>
              <p className="text-xs text-slate-400 mb-1.5">moyen</p>
            </div>
            {/* Barre de progression simple */}
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                style={{ width: `${avgOccupancy}%` }}
                className="h-full bg-indigo-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        {/* RÉSERVATIONS TOTALES */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl">
            🎾
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Réservations
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
            <p className="text-xs text-orange-600 font-medium">
              ~ {(totalBookings / 365).toFixed(1)}{" "}
              <span className="text-slate-400">parties / jour</span>
            </p>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE PRINCIPAL (Bar Chart Tailwind) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg text-slate-800">
            Évolution des Revenus
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
              <span className="text-slate-500">Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-200 rounded-full"></span>
              <span className="text-slate-500">Objectif</span>
            </div>
          </div>
        </div>

        {/* Zone du Graphique */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip au survol */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2 whitespace-nowrap z-10">
                {d.revenue}€ ({d.occupancy}%)
              </div>

              {/* Barre Objectif (Arrière plan) */}
              <div className="w-full max-w-[40px] bg-indigo-50 rounded-t-xl relative h-full flex items-end overflow-hidden">
                {/* Barre Réelle (Premier plan) */}
                <div
                  style={{ height: getBarHeight(d.revenue) }}
                  className={`w-full transition-all duration-1000 ease-out rounded-t-lg group-hover:bg-indigo-500 ${
                    i === data.length - 1 ? "bg-indigo-500" : "bg-indigo-600"
                  }`} // La dernière barre est plus claire pour montrer "en cours"
                ></div>
              </div>

              {/* Label Mois */}
              <span className="text-xs text-slate-400 mt-3 font-medium">
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
