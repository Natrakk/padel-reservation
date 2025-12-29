import { useState, useEffect } from 'react';
import { db } from '../../../mocks/database';
import { api } from '../../../services/api';
import type { User, AdminBookingView } from '../../../types';
// UI COMPONENTS
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/ui/Searchbar';
import { PageHeader } from '../../../components/admin/ui/PageHeader';
import { Avatar } from '../../../components/ui/Avatar';

export default function ClientsView() {
  // --- ÉTATS ---
  const [users, setUsers] = useState<User[]>([]);
  const [allBookings, setAllBookings] = useState<AdminBookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // États Modal
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // --- CHARGEMENT ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const bookingsData = await api.getAllBookingsWithDetails();
      setUsers(db.users.filter(u => u.role === 'client'));
      setAllBookings(bookingsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- LOGIQUE ---
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientHistory = (userId: string) => {
    return allBookings
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setShowHistory(false);
  };

  // Variables calculées pour le modal
  const clientHistory = selectedClient ? getClientHistory(selectedClient.id) : [];
  const lastBooking = clientHistory.length > 0 ? clientHistory[0] : null;

  if (loading) return <div className="p-12 text-center text-slate-400">Chargement de la base clients...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">

      {/* 1. HEADER STANDARDISÉ */}
      <PageHeader title="Base Clients" subtitle={`${filteredUsers.length} clients enregistrés`}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher nom ou email..."
        />
      </PageHeader>

      {/* 2. TABLEAU LISTE CLIENTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
              <th className="p-4 font-bold">Client</th>
              <th className="p-4 font-bold">Statut Visite</th>
              <th className="p-4 font-bold">Total Résas</th>
              <th className="p-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const nbResas = allBookings.filter(b => b.userId === user.id).length;

                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedClient(user)}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <Avatar name={user.name} image={user.avatar} size="md" />
                      <div>
                        <span className="font-bold text-slate-700 block">{user.name}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {nbResas > 0 ? (
                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full border border-green-100">Déjà venu</span>
                      ) : (
                        <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">Nouveau</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        {nbResas} réservations
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all shadow-sm">
                        👁️
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                  Aucun client trouvé pour "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. MODAL FICHE CLIENT */}
      <Modal isOpen={!!selectedClient} onClose={handleCloseModal} title="Fiche Client">
        {selectedClient && (
          <div className="text-center">

            {/* Header Profil avec Avatar XL */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-3 p-1 bg-white rounded-full border-2 border-slate-100 shadow-md">
                <Avatar name={selectedClient.name} image={selectedClient.avatar} size="xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedClient.name}</h2>
              <p className="text-sm text-slate-500">{selectedClient.email}</p>
            </div>

            {/* Dernière Réservation */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
                Dernière Visite
              </div>

              {lastBooking ? (
                <div className="flex items-center gap-4 mt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-center min-w-[50px]">
                    <div className="text-xs text-slate-400 font-bold uppercase">{new Date(lastBooking.start).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                    <div className="text-lg font-bold text-slate-800">{new Date(lastBooking.start).getDate()}</div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{lastBooking.resourceName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(lastBooking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                      {lastBooking.paymentStatus === 'paid' ? <span className="text-green-600 ml-1">Payé</span> : <span className="text-orange-500 ml-1">Reste {lastBooking.amountDue}€</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-2">Aucune réservation pour le moment.</p>
              )}
            </div>

            {/* Historique Dépliant */}
            <div className="mb-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group shadow-sm"
              >
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  🕒 Historique complet
                  <span className="bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded-md">{clientHistory.length}</span>
                </span>
                <span className={`text-slate-400 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showHistory && (
                <div className="mt-2 bg-slate-50 rounded-xl border border-slate-100 max-h-48 overflow-y-auto animate-in slide-in-from-top-2 p-2 space-y-2">
                  {clientHistory.length > 0 ? clientHistory.map(booking => (
                    <div key={booking.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">{new Date(booking.start).toLocaleDateString()}</span>
                        <span className="font-bold text-slate-700">{booking.resourceName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {booking.status === 'confirmed' ? 'OK' : 'Annulé'}
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 py-2">Rien à afficher.</p>
                  )}
                </div>
              )}
            </div>

            <Button variant="secondary" onClick={handleCloseModal} className="w-full">
              Fermer la fiche
            </Button>

          </div>
        )}
      </Modal>
    </div>
  );
}