import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { Calendar } from '../../../components/ui/Calendar';
import type { User, Resource, ExtendedBooking } from '../../../types';

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    clients: User[];
    resources: Resource[];
    bookings: ExtendedBooking[]; // <--- 1. NOUVELLE PROP
    initialDate: Date;
    preselectedData: { resourceId: string; hour: string };
    onCreateBooking: (userId: string, resourceId: string, hour: string, date: string) => void;
    onCreateClient: (user: Partial<User>) => User;
}

export default function CreateBookingModal({
    isOpen,
    onClose,
    clients,
    resources,
    bookings, // <--- 1. RÉCUPÉRATION PROP
    initialDate,
    preselectedData,
    onCreateBooking,
    onCreateClient
}: Props) {

    // --- ÉTATS ---
    const [clientMode, setClientMode] = useState<'search' | 'create'>('search');
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '' });
    const [formData, setFormData] = useState({ resourceId: '', hour: '10', date: '' });
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Sync ouverture
    useEffect(() => {
        if (isOpen) {
            const year = initialDate.getFullYear();
            const month = String(initialDate.getMonth() + 1).padStart(2, '0');
            const day = String(initialDate.getDate()).padStart(2, '0');
            setFormData({
                resourceId: preselectedData.resourceId,
                hour: preselectedData.hour,
                date: `${year}-${month}-${day}`
            });
            setShowCalendar(false);
        }
    }, [isOpen, preselectedData, initialDate]);

    // Fermeture calendrier click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 2. LOGIQUE DE VÉRIFICATION DISPONIBILITÉ ---
    const isResourceTaken = (resourceId: string) => {
        if (!formData.date || !formData.hour) return false;

        const selectedHour = parseInt(formData.hour, 10);
        // On crée une date locale pour comparer correctement
        const targetDate = new Date(formData.date);

        return bookings.some(b => {
            const bDate = new Date(b.start);
            return b.resourceId === resourceId &&
                bDate.getHours() === selectedHour &&
                bDate.getDate() === targetDate.getDate() &&
                bDate.getMonth() === targetDate.getMonth() &&
                bDate.getFullYear() === targetDate.getFullYear();
        });
    };

    // Helpers Client
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()));

    const handleQuickCreateClient = () => {
        if (!newClientData.name) return;
        const user = onCreateClient(newClientData);
        setSelectedClient(user);
        setClientMode('search');
        setNewClientData({ name: '', email: '', phone: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient || !formData.resourceId || !formData.date) return;
        onCreateBooking(selectedClient.id, formData.resourceId, formData.hour, formData.date);
        setSelectedClient(null);
        setClientSearch("");
        setClientMode('search');
    };

    const dateLabel = formData.date ? new Date(formData.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'Choisir une date';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Réservation">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* SÉLECTION CLIENT (Code inchangé) */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Client Principal</label>
                        {!selectedClient && (
                            <button type="button" onClick={() => setClientMode(clientMode === 'search' ? 'create' : 'search')} className="text-xs font-bold text-indigo-600 hover:underline transition-colors">
                                {clientMode === 'search' ? '+ Créer un compte' : '← Rechercher existant'}
                            </button>
                        )}
                    </div>
                    {selectedClient ? (
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-200 shadow-sm animate-in fade-in">
                            <div className="flex items-center gap-3"><Avatar name={selectedClient.name} size="sm" /><div><p className="font-bold text-sm text-slate-800">{selectedClient.name}</p><p className="text-[10px] text-slate-500">{selectedClient.email}</p></div></div>
                            <button type="button" onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">✕</button>
                        </div>
                    ) : clientMode === 'search' ? (
                        <div className="relative animate-in fade-in slide-in-from-left-2">
                            <input type="text" placeholder="🔍 Nom ou email..." className="w-full p-3 pl-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} autoFocus />
                            {clientSearch && (<div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-2 max-h-48 overflow-y-auto z-20 custom-scrollbar">{filteredClients.length > 0 ? filteredClients.map(c => (<div key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(""); }} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"><span className="font-medium text-slate-700 text-sm">{c.name}</span><span className="text-xs text-slate-400">{c.email}</span></div>)) : (<div className="p-4 text-center text-sm text-slate-400">Aucun client trouvé.<br /><button type="button" onClick={() => setClientMode('create')} className="text-indigo-600 font-bold hover:underline mt-1">Créer {clientSearch} ?</button></div>)}</div>)}
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
                            <div className="grid grid-cols-2 gap-3"><div className="col-span-2"><input type="text" placeholder="Nom complet *" className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newClientData.name} onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })} /></div><input type="email" placeholder="Email" className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newClientData.email} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} /><input type="tel" placeholder="Téléphone" className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newClientData.phone} onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })} /></div>
                            <Button type="button" onClick={handleQuickCreateClient} className="w-full py-3 text-sm bg-indigo-600 hover:bg-indigo-700 shadow-md">Créer & Sélectionner</Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 relative">
                    {/* DATE + HEURE */}
                    <div className="space-y-4">
                        <div className="relative" ref={calendarRef}>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                            <button type="button" onClick={() => setShowCalendar(!showCalendar)} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-left flex items-center justify-between hover:bg-slate-50 transition-colors"><span className="font-medium text-slate-700 capitalize text-sm">{dateLabel}</span><span>📅</span></button>
                            {showCalendar && (<div className="absolute top-full left-0 mt-2 z-30 animate-in zoom-in-95 origin-top-left"><Calendar selectedDate={new Date(formData.date || new Date())} onChange={(d) => { const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); setFormData({ ...formData, date: `${year}-${month}-${day}` }); setShowCalendar(false); }} /></div>)}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Horaire</label>
                            <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" value={formData.hour} onChange={(e) => setFormData({ ...formData, hour: e.target.value, resourceId: '' })}>{HOURS.map(h => <option key={h} value={h}>{h}h00 - {h + 1}h00</option>)}</select>
                        </div>
                    </div>

                    {/* TERRAINS (AVEC LOGIQUE DISABLED) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Terrains</label>
                        <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                            {resources.map(r => {
                                // --- 3. ON UTILISE LA FONCTION ICI ---
                                const isTaken = isResourceTaken(r.id);
                                const isSelected = formData.resourceId === r.id;

                                return (
                                    <button
                                        type="button"
                                        key={r.id}
                                        disabled={isTaken} // <--- EMPÊCHE LE CLIC
                                        onClick={() => setFormData({ ...formData, resourceId: r.id })}
                                        className={`
                                            p-3 rounded-xl text-sm border text-left transition-all duration-200 flex justify-between items-center
                                            ${isTaken
                                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' // STYLE GRISÉ
                                                : isSelected
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div>
                                            <div className="font-bold">{r.name}</div>
                                            <div className={`text-[10px] uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{r.type}</div>
                                        </div>
                                        {isTaken && <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded text-slate-400">Occupé</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
                    <Button disabled={!selectedClient || !formData.resourceId || !formData.date} className="flex-1 shadow-lg shadow-indigo-200">Valider la Réservation</Button>
                </div>
            </form>
        </Modal>
    );
}