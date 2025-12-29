import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";

interface Props {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: Props) {
  // On récupère les fonctions depuis notre Context
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // CONNEXION : Le nom sera récupéré par le service via l'email
        // (Assure-toi que ton AuthContext.login n'attend bien que l'email)
        const success = await login(email);
        if (!success)
          throw new Error("Email inconnu (Essayez 'admin@padel.com')");
      } else {
        // INSCRIPTION : On utilise le NOM saisi par l'utilisateur
        if (!name.trim()) throw new Error("Le nom est obligatoire");
        const success = await register(email, name);
        if (!success) throw new Error("Erreur lors de l'inscription");
      }

      onSuccess(); // Redirection vers l'accueil/réservation
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-100">
        {/* Onglets Connexion / Inscription */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              isLogin
                ? "text-indigo-600 bg-indigo-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              !isLogin
                ? "text-indigo-600 bg-indigo-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? "Heureux de vous revoir !" : "Bienvenue au Club"}
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            {isLogin
              ? "Connectez-vous pour réserver."
              : "Remplissez vos infos pour commencer."}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CHAMP NOM : Visible uniquement à l'inscription */}
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ex: Thomas Anderson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ex: thomas@matrix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              disabled={loading}
              className="w-full py-4 mt-2 shadow-lg shadow-indigo-200"
            >
              {loading
                ? "Chargement..."
                : isLogin
                ? "Se connecter"
                : "S'inscrire"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
