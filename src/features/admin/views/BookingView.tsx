import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { AdminBookingView } from '../../../types';
// COMPOSANTS UI
import { SearchBar } from '../../../components/ui/Searchbar';
import { PageHeader } from '../../../components/admin/ui/PageHeader';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Avatar } from '../../../components/ui/Avatar';

export default function BookingsView() {
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.getAllBookingsWithDetails().then(data => {
      // Tri du plus récent au plus ancien
      const sorted = data.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
      setBookings(sorted);
      setLoading(false);
    });
  }, []);

  // FILTRAGE
  const filteredBookings = bookings.filter(b => {
    const term = searchQuery.toLowerCase();
    return (
      b.user?.name.toLowerCase().includes(term) ||      // Nom
      b.resourceName?.toLowerCase().includes(term) ||   // Terrain
      b.id.toLowerCase().includes(term)                 // ID
    );
  });

  if (loading) return <div className="p-12 text-center text-slate-400">Chargement de l'historique...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">

      {/* 1. HEADER STANDARDISÉ */}
      <PageHeader title="Historique Réservations" subtitle={`${filteredBookings.length} dossiers trouvés`}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher client, terrain, ID..."
        />
      </PageHeader>

      {/* 2. LISTE */}
      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between hover:border-indigo-300 transition-colors gap-4">

              {/* GAUCHE : Date + User */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Date Box (Design spécifique conservé ici) */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center min-w-[60px]">
                  <div className="text-xs text-slate-500 uppercase font-bold">
                    {new Date(booking.start).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {new Date(booking.start).getDate()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar name={booking.user?.name || '?'} size="md" />
                  <div>
                    <p className="font-bold text-slate-800">{booking.user?.name || 'Inconnu'}</p>
                    <p className="text-sm text-slate-500">
                      {booking.resourceName} • <span className="text-slate-700 font-medium">{new Date(booking.start).getHours()}h00</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* DROITE : Status & ID */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

                <div className="text-right">
                  {/* Badge Paiement */}
                  <StatusBadge
                    variant="payment"
                    status={booking.paymentStatus === 'paid' ? 'paid' : 'pending'}
                    label={booking.amountDue > 0 ? `Reste ${booking.amountDue}€` : undefined}
                  />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">#{booking.id}</p>
                </div>

                {/* Badge Présence (Check-in) */}
                <div title={booking.checkedIn ? 'Présent' : 'En attente'}>
                  <StatusBadge variant="checkin" status={booking.checkedIn} />
                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="text-4xl mb-2 block opacity-30">🔍</span>
            <p className="text-slate-400">Aucune réservation trouvée pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}