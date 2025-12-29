import { useState } from "react";
import AdminLayout from "./AdminLayout";

// Import des Vues
import StatsDashboard from "./views/StatsDashboard";
import ClientsView from "./views/ClientsView";
import BookingsView from "./views/BookingView";
import PlanningView from "./views/PlanningView";

export default function AdminDashboard() {
  // Gestion de l'onglet actif
  const [currentTab, setCurrentTab] = useState<
    "planning" | "stats" | "clients" | "bookings"
  >("planning");

  // Fonction pour rendre le contenu dynamique
  const renderContent = () => {
    switch (currentTab) {
      case "planning":
        return <PlanningView />;
      case "stats":
        return <StatsDashboard />;
      case "clients":
        return <ClientsView />;
      case "bookings":
        return <BookingsView />;
      default:
        return <PlanningView />;
    }
  };

  return (
    <AdminLayout activeTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </AdminLayout>
  );
}
