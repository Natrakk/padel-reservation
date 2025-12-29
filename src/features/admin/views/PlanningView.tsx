import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import type { AdminBookingView } from "../../../types";
import { Button } from "../../../components/ui/Button";

// --- CONFIG ---
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export default function PlanningView() {
  // --- ETATS ---
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingView | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [bookingsData, resourcesData] = await Promise.all([
          api.getAllBookingsWithDetails(),
          api.getResources(),
        ]);
        setBookings(bookingsData);
        setResources(resourcesData);
      } catch (e) {
        console.error("Erreur chargement planning", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- ACTIONS ---
  const handleCheckIn = async (bookingId: string) => {
    // 1. Mise à jour Optimiste (Instantané pour l'UI)
    const updatedBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, checkedIn: true } : b
    );
    setBookings(updatedBookings);

    // Mise à jour de la sidebar si ouverte
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) =>
        prev ? { ...prev, checkedIn: true } : null
      );
    }

    // 2. Appel API Réel
    await api.updateBookingStatus(bookingId, { checkedIn: true });
  };

  const handlePayBalance = async (bookingId: string) => {
    const updatedBookings = bookings.map((b) =>
      b.id === bookingId
        ? { ...b, amountDue: 0, paymentStatus: "paid" as const }
        : b
    );
    setBookings(updatedBookings);

    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) =>
        prev ? { ...prev, amountDue: 0, paymentStatus: "paid" } : null
      );
    }

    await api.updateBookingStatus(bookingId, {
      amountDue: 0,
      paymentStatus: "paid",
    });
  };

  // --- STATS RAPIDES (Top Bar du planning) ---
  const pendingAmount = bookings.reduce(
    (acc, b) => acc + (b.amountDue || 0),
    0
  );
  const checkins = bookings.filter((b) => b.checkedIn).length;

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">
        Chargement du Planning...
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      {/* BARRE D'INFO RAPIDE */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Reste à encaisser
            </span>
            <span
              className={`font-bold ${
                pendingAmount > 0 ? "text-slate-800" : "text-green-600"
              }`}
            >
              {pendingAmount}€
            </span>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Check-in
            </span>
            <span className="font-bold text-slate-800">
              {checkins} / {bookings.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* GRILLE GANTT (3 Colonnes) */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-6">
              {/* Header Heures */}
              <div className="grid grid-cols-[150px_repeat(12,1fr)] gap-1 mb-4 border-b border-slate-100 pb-2">
                <div className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                  Terrain
                </div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="text-center text-xs font-bold text-slate-400"
                  >
                    {h}h
                  </div>
                ))}
              </div>

              {/* Lignes Terrains */}
              <div className="space-y-3">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="grid grid-cols-[150px_repeat(12,1fr)] gap-1 items-center h-12 hover:bg-slate-50 transition-colors rounded-lg px-1"
                  >
                    <div className="text-sm font-bold text-slate-700 truncate pr-2 flex flex-col">
                      <span>{res.name}</span>
                      <span className="text-[9px] text-slate-400 font-normal uppercase">
                        {res.type}
                      </span>
                    </div>

                    {HOURS.map((h) => {
                      // Trouver la résa
                      const booking = bookings.find((b) => {
                        const bDate = new Date(b.start);
                        return (
                          b.resourceId === res.id && bDate.getHours() === h
                        );
                      });

                      if (booking) {
                        return (
                          <div
                            key={h}
                            onClick={() => setSelectedBooking(booking)}
                            className={`
                              h-10 rounded-lg text-[10px] flex items-center justify-center font-bold cursor-pointer relative border transition-all hover:scale-105 hover:z-10 shadow-sm
                              ${
                                booking.checkedIn
                                  ? "bg-slate-800 text-white border-slate-800"
                                  : booking.amountDue > 0
                                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              }
                            `}
                          >
                            {/* Pastille Rouge si impayé */}
                            {booking.amountDue > 0 && !booking.checkedIn && (
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                            {booking.user?.name.split(" ")[0] || "Client"}
                          </div>
                        );
                      }
                      // Case vide
                      return (
                        <div
                          key={h}
                          className="h-10 rounded-lg border border-slate-50 bg-slate-50/50"
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DETAILS (1 Colonne) */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 h-full animate-in slide-in-from-right-4 sticky top-6">
              {/* Header Sidebar */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-slate-800">
                  Détails Résa
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Info Client */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {selectedBooking.user?.avatar ||
                    selectedBooking.user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">
                    {selectedBooking.user?.name || "Client Inconnu"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedBooking.user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                    {selectedBooking.user?.role}
                  </span>
                </div>
              </div>

              {/* Info Terrain */}
              <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Terrain</span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.resourceName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedBooking.start).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Horaire</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedBooking.start).getHours()}h00 -{" "}
                    {new Date(selectedBooking.end).getHours()}h00
                  </span>
                </div>
              </div>

              {/* ACTION : PAIEMENT */}
              <div
                className={`p-4 rounded-xl border mb-4 transition-colors ${
                  selectedBooking.amountDue > 0
                    ? "bg-orange-50 border-orange-100"
                    : "bg-green-50 border-green-100"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-xs font-bold uppercase ${
                      selectedBooking.amountDue > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedBooking.amountDue > 0
                      ? "Reste à payer"
                      : "Tout est réglé"}
                  </span>
                  {selectedBooking.amountDue > 0 && (
                    <span className="text-xl font-bold text-orange-600">
                      {selectedBooking.amountDue}€
                    </span>
                  )}
                </div>

                {selectedBooking.amountDue > 0 && (
                  <Button
                    onClick={() => handlePayBalance(selectedBooking.id)}
                    className="w-full py-2 text-sm bg-orange-500 hover:bg-orange-600 shadow-orange-200"
                  >
                    💸 Encaisser {selectedBooking.amountDue}€
                  </Button>
                )}
              </div>

              {/* ACTION : CHECK-IN */}
              {!selectedBooking.checkedIn ? (
                <Button
                  onClick={() => handleCheckIn(selectedBooking.id)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200"
                >
                  ✅ Valider Arrivée (Check-in)
                </Button>
              ) : (
                <div className="bg-slate-800 text-white font-bold text-center py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg opacity-90">
                  <span>✓</span> Joueur Présent
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  ID Réservation
                </p>
                <p className="font-mono text-xs text-slate-500">
                  #{selectedBooking.id}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <span className="text-4xl mb-4 opacity-50">👆</span>
              <p className="text-sm font-medium text-slate-500">
                Sélectionnez un créneau
              </p>
              <p className="text-xs mt-1">
                Cliquez sur une réservation dans la grille pour voir les détails
                et encaisser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
