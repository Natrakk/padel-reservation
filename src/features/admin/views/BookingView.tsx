import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import type { AdminBookingView } from "../../../types";

export default function BookingsView() {
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllBookingsWithDetails().then((data) => {
      // Tri par date décroissante (le plus récent en haut)
      const sorted = data.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
      );
      setBookings(sorted);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Date Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center min-w-[60px]">
              <div className="text-xs text-slate-500 uppercase font-bold">
                {new Date(booking.start).toLocaleDateString("fr-FR", {
                  month: "short",
                })}
              </div>
              <div className="text-xl font-bold text-slate-800">
                {new Date(booking.start).getDate()}
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                {booking.user?.name || "Inconnu"}
              </p>
              <p className="text-sm text-slate-500">
                {booking.resourceName} • {new Date(booking.start).getHours()}h00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-bold text-slate-800">
                {booking.paymentStatus === "paid" ? (
                  <span className="text-green-600">Payé</span>
                ) : (
                  <span className="text-orange-500">
                    Reste {booking.amountDue}€
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">#{booking.id}</p>
            </div>

            <div
              className={`w-3 h-3 rounded-full ${
                booking.checkedIn ? "bg-slate-800" : "bg-slate-200"
              }`}
              title={booking.checkedIn ? "Présent" : "Pas encore arrivé"}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
