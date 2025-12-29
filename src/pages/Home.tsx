import { Button } from "../components/ui/Button";

export default function Home({ onBookClick }: { onBookClick: () => void }) {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Background abstrait */}
        <div className="absolute inset-0 bg-slate-900 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626248318958-3f4135543c7b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm font-bold backdrop-blur-sm">
            🚀 Le meilleur Padel de la région
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Jouez. Transpirez. <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Progressez.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            5 terrains panoramiques dernière génération. Une application simple
            pour réserver en 3 clics. Rejoignez la communauté dès aujourd'hui.
          </p>
          <div className="pt-4">
            <Button
              onClick={onBookClick}
              className="px-8 py-4 text-lg shadow-indigo-500/50 shadow-2xl"
            >
              Réserver un terrain
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
                🏆
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Terrains WPT
              </h3>
              <p className="text-slate-500">
                Moquette dernière génération et vitres panoramiques pour un jeu
                optimal.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Réservation Flash
              </h3>
              <p className="text-slate-500">
                Réservez en 10 secondes. Payez votre part ou tout le terrain
                directement.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
                🍻
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Club House
              </h3>
              <p className="text-slate-500">
                Après l'effort, le réconfort. Profitez de notre bar et espace
                détente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
