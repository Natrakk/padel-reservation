import { Button } from '../../../components/ui/Button';

interface Props {
    totalPrice: number;
    racketPrice: number;
    paidSeats: number;
    rackets: number;
    onUpdate: (seats: number, rackets: number) => void;
}

export default function PaymentControl({ totalPrice, racketPrice, paidSeats, rackets, onUpdate }: Props) {
    const seatPrice = totalPrice / 4;
    const totalDue = totalPrice + (rackets * racketPrice);
    const totalPaid = (paidSeats * seatPrice);
    const remaining = totalDue - totalPaid;
    const isFullyPaid = remaining <= 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* HEADER : Visualisation des 4 joueurs */}
            <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paiements Joueurs</span>
                    <span className="text-xs font-medium text-slate-500">{seatPrice}€ / pers.</span>
                </div>

                <div className="flex gap-3 w-44">
                    {[1, 2, 3, 4].map((num) => {
                        const isPaid = num <= paidSeats;
                        return (
                            <button
                                key={num}
                                onClick={() => onUpdate(isPaid ? num - 1 : num, rackets)}
                                className={`
                  flex-1 h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative group
                  ${isPaid
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 translate-y-px'
                                        : 'bg-white border-2 border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-400'}
                `}
                            >
                                {isPaid ? (
                                    <svg className="w-5 h-5 animate-in zoom-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="font-bold text-sm">J{num}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BODY : Raquettes & Calculs */}
            <div className="p-5 space-y-5">

                {/* Ligne Raquettes */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">Location Raquettes</span>
                        <span className="text-[10px] text-slate-400 font-medium">+ {racketPrice}€ / unité</span>
                    </div>

                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => onUpdate(paidSeats, Math.max(0, rackets - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-500 hover:text-slate-800 transition-colors"
                        >-</button>
                        <span className="w-8 text-center font-bold text-slate-800 text-sm">{rackets}</span>
                        <button
                            onClick={() => onUpdate(paidSeats, rackets + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                        >+</button>
                    </div>
                </div>

                {/* Séparateur pointillé */}
                <div className="border-t-2 border-dashed border-slate-100"></div>

                {/* Résumé Financier */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Reste à payer</p>
                        <div className={`text-3xl font-bold tracking-tight ${isFullyPaid ? 'text-emerald-500' : 'text-slate-900'}`}>
                            {remaining}€
                        </div>
                        {!isFullyPaid && (
                            <p className="text-[10px] text-slate-400 mt-1">Sur un total de {totalDue}€</p>
                        )}
                    </div>

                    {/* Bouton d'action */}
                    <div>
                        {isFullyPaid ? (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-100">
                                <span>✨ Réglé</span>
                            </div>
                        ) : (
                            <Button
                                onClick={() => onUpdate(4, rackets)}
                                className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 text-sm py-2.5 px-5"
                            >
                                Tout Solder
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}