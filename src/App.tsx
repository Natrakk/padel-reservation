import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // AJOUT de useLocation
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import BookingWizard from "./features/booking/BookingWizard";
import AuthPage from "./features/auth/AuthPage";
import AdminDashboard from "./features/admin/AdminDashboard";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation(); // On récupère l'URL actuelle

  // Est-ce qu'on est sur une page admin ?
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* 1. On affiche la Navbar SEULEMENT si on n'est PAS sur l'admin */}
      {!isAdminPage && <Navbar />}

      <main className="flex-1 flex flex-col">
        {/* Note: j'ai ajouté flex-col ici pour que l'admin prenne toute la hauteur si besoin */}

        <Routes>
          <Route
            path="/"
            element={<Home onBookClick={() => navigate("/booking")} />}
          />
          <Route
            path="/login"
            element={<AuthPage onSuccess={() => navigate("/")} />}
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingWizard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* 2. Pareil pour le Footer : on le cache sur l'admin pour avoir le dashboard en plein écran */}
      {!isAdminPage && (
        <footer className="bg-slate-900 text-slate-400 py-12 text-center">
          <p className="text-sm">© 2025 PadelClub. Tous droits réservés.</p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
