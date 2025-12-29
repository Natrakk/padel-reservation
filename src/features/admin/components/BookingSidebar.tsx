import type { ExtendedBooking, Resource } from '../../../types';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import PaymentControl from './PaymentControl';

interface Props {
    booking: ExtendedBooking | null;
    resource: Resource | undefined;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<ExtendedBooking>) => void;
}

export default function BookingSidebar({ booking, resource, onClose, onUpdate }: Props) {

    const handlePaymentUpdate = (newSeats: number, newRackets: number) => {
        if (!booking) return;
        const basePrice = resource?.pricePerHour || 20;
        const racketPrice = 4;
        const totalCost = basePrice + (newRackets * racketPrice);
        const paidAmount = (newSeats * (basePrice / 4));
        const remaining = Math.max(0, totalCost - paidAmount);

        onUpdate(booking.id, {
            paidSeats: newSeats,
            rackets: newRackets,
            amountDue: remaining,
            paymentStatus: remaining <= 0 ? 'paid' : 'pending'
        });
    };

    return (
        <>
            {/* Backdrop invisible mais cliquable pour fermer */}
            <div
                className={`fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${booking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Le Panneau Latéral */}
            <div
                className={`
          fixed top-4 right-4 bottom-4 w-full sm:w-[380px] bg-white rounded-3xl shadow-2xl z-50 
          transform transition-transform duration-300 ease-out border border-white/50
          flex flex-col overflow-hidden
          ${booking ? 'translate-x-0' : 'translate-x-[120%]'}
        `}
            >
                {booking && (
                    <>
                        {/* Header Sticky */}
                        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-slate-800">Réservation</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                            >✕</button>
                        </div>

                        {/* Contenu Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                            {/* Carte Client */}
                            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Avatar name={booking.user?.name || '?'} size="lg" className="shadow-sm bg-white" />
                                <div>
                                    <p className="font-bold text-slate-900">{booking.user?.name}</p>

                                    {/* Email */}
                                    <p className="text-xs text-slate-500 mb-0.5">{booking.user?.email}</p>

                                    {/* Téléphone (AJOUTÉ ICI) */}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="bg-indigo-50 p-1 rounded text-[10px]">📞</span>
                                        <span className="text-xs font-medium text-slate-600">
                                            {booking.user?.phone || 'Non renseigné'}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <StatusBadge variant="checkin" status={booking.checkedIn} />
                                    </div>
                                </div>
                            </div>

                            {/* Grille Infos (Date/Lieu) */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Horaire</span>
                                    <span className="text-lg font-bold text-indigo-600 block">
                                        {new Date(booking.start).getHours()}h <span className="text-sm text-slate-300 font-normal">- {new Date(booking.end).getHours()}h</span>
                                    </span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Terrain</span>
                                    <span className="text-sm font-bold text-slate-700 block mt-1">{booking.resourceName}</span>
                                </div>
                                <div className="col-span-2 bg-white p-2 rounded-xl border border-slate-100 text-center">
                                    <span className="text-xs font-medium text-slate-500">
                                        📅 {new Date(booking.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>

                            {/* Module de Paiement (Le nouveau composant) */}
                            <div className="mb-20"> {/* Marge pour ne pas être caché par le bouton du bas */}
                                <PaymentControl
                                    totalPrice={resource?.pricePerHour || 20}
                                    racketPrice={4}
                                    paidSeats={booking.paidSeats || 0}
                                    rackets={booking.rackets || 0}
                                    onUpdate={handlePaymentUpdate}
                                />
                            </div>

                        </div>

                        {/* Footer Action (Sticky en bas) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex items-end">
                            <div className="w-full pointer-events-auto">
                                {!booking.checkedIn ? (
                                    <Button
                                        onClick={() => onUpdate(booking.id, { checkedIn: true })}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl shadow-lg shadow-indigo-200 text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Valider Arrivée Client
                                    </Button>
                                ) : (
                                    <div className="w-full py-4 bg-emerald-50 text-emerald-600 font-bold text-center rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                                        <span>✓</span> Client Présent sur le terrain
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}