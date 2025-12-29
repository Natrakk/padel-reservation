import { Link, useLocation, useNavigate } from "react-router-dom"; // Nouveaux imports
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation(); // Pour savoir sur quelle page on est (style actif)
  const navigate = useNavigate(); // Pour rediriger manuellement

  // Fonction pour vérifier si le lien est actif
  const isActive = (path: string) => location.pathname === path;

  // Initiales pour l'avatar
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/"); // Retour accueil après déco
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        {/* LOGO (Link vers accueil) */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-200">
            🎾
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight hidden sm:block">
            Padel<span className="text-indigo-600">Club</span>
          </span>
        </Link>

        {/* NAVIGATION (Links) */}
        <div className="hidden md:flex items-center gap-8 bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-indigo-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Le Club
          </Link>
          <Link
            to="/booking"
            className={`text-sm font-medium transition-colors ${
              isActive("/booking")
                ? "text-indigo-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Réserver
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors ${
                isActive("/admin")
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* PROFIL UTILISATEUR */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  BONJOUR
                </p>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
              </div>

              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-md ring-1 ring-indigo-100">
                {getInitials(user.name)}
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-600 underline ml-1 font-medium"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Se connecter
              </Link>
              <Link to="/login">
                <Button className="py-2.5 px-5 text-sm shadow-none">
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
