import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import type { ExtendedBooking } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    bookings: ExtendedBooking[];
    totalPending: number;
    onSelectBooking: (booking: ExtendedBooking) => void;
}

export default function UnpaidModal({ isOpen, onClose, bookings, totalPending, onSelectBooking }: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Liste des Impayés">
            <div className="space-y-4">

                {/* Résumé en haut */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-100 p-1.5 rounded-md text-orange-600">⚠️</span>
                        <span className="text-orange-900 font-bold text-sm">Total à récupérer</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{totalPending}€</span>
                </div>

                {/* Liste détaillée */}
                {bookings.length > 0 ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 py-1">
                        {bookings.map(booking => {
                            const dateObj = new Date(booking.start);
                            const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

                            return (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => onSelectBooking(booking)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <Avatar name={booking.user?.name || '?'} size="md" className="shrink-0" />

                                        <div className="flex flex-col">
                                            {/* Nom + Téléphone */}
                                            <span className="font-bold text-slate-800 text-sm leading-tight">
                                                {booking.user?.name}
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                📞 {booking.user?.phone || 'Non renseigné'}
                                            </span>

                                            {/* Date + Heure + Terrain */}
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md w-fit border border-slate-100">
                                                <span className="font-semibold capitalize text-indigo-600">{dateStr}</span>
                                                <span className="text-slate-300">|</span>
                                                <span>{dateObj.getHours()}h00</span>
                                                <span className="text-slate-300">|</span>
                                                <span className="truncate max-w-[80px]">{booking.resourceName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Montant + Action */}
                                    <div className="text-right shrink-0 pl-2">
                                        <span className="block font-bold text-lg text-orange-600">{booking.amountDue}€</span>
                                        <span className="text-[10px] text-slate-400 font-medium group-hover:text-indigo-600 flex items-center justify-end gap-1 transition-colors">
                                            Voir <span className="text-lg leading-3">›</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <span className="text-4xl block mb-3 opacity-50">🎉</span>
                        <p className="font-medium">Aucun impayé en cours !</p>
                        <p className="text-xs mt-1">Tout a été réglé pour cette période.</p>
                    </div>
                )}

                <Button variant="secondary" onClick={onClose} className="w-full mt-2">
                    Fermer la liste
                </Button>
            </div>
        </Modal>
    );
}