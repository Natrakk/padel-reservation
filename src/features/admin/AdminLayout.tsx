import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  activeTab: "planning" | "stats" | "clients" | "bookings";
  onTabChange: (tab: any) => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeTab,
  onTabChange,
  children,
}: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "planning", label: "Planning", icon: "📅" },
    { id: "bookings", label: "Réservations", icon: "list" }, // Icône simplifiée
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "stats", label: "Statistiques", icon: "📊" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR GAUCHE (Fixe) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        {/* Logo Admin */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">
            Admin<span className="text-indigo-400">Panel</span>
          </span>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <span className="text-xl">
                {item.icon === "list" ? "📋" : item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">Administrateur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800 hover:text-white transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU (Scrollable) */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header Mobile / Titre Contextuel */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {menuItems.find((i) => i.id === activeTab)?.label}
          </h1>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            Voir le site public →
          </Link>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
