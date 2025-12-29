import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { db } from '../../../mocks/database';
import type { AdminBookingView, Resource, User } from '../../../types';

// UI COMPONENTS
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PageHeader } from '../../../components/admin/ui/PageHeader';
import { StatCard } from '../../../components/admin/ui/StatCard';
import { Calendar } from '../../../components/ui/Calendar'; // Ton nouveau composant

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const RACKET_PRICE = 4;

// Extension locale pour gérer les compteurs UI
interface ExtendedBooking extends AdminBookingView {
  paidSeats?: number; // 0 à 4
  rackets?: number;   // 0 à 10
}

export default function PlanningView() {
  // --- ÉTATS GLOBAUX ---
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  // ÉTAT DATE & CALENDRIER
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // ÉTATS MODALE CRÉATION
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientMode, setClientMode] = useState<'search' | 'create'>('search');
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientForBooking, setSelectedClientForBooking] = useState<User | null>(null);

  // Données Formulaire
  const [newClientData, setNewClientData] = useState({ name: '', email: '' });
  const [newBookingData, setNewBookingData] = useState({ resourceId: '', hour: '10' });

  // --- CHARGEMENT ---
  const loadData = async () => {
    try {
      const [bookingsData, resourcesData] = await Promise.all([
        api.getAllBookingsWithDetails(),
        api.getResources()
      ]);

      // Enrichissement des données avec valeurs par défaut
      const enrichedBookings = bookingsData.map(b => ({
        ...b,
        paidSeats: b.amountDue === 0 ? 4 : 0,
        rackets: 0
      }));

      setBookings(enrichedBookings);
      setResources(resourcesData);
      setClients(db.users.filter(u => u.role === 'client'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); loadData(); }, []);

  // --- LOGIQUE DATE ---
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

  const dateLabel = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  // --- LOGIQUE FINANCIÈRE ---
  const getBasePrice = (booking: ExtendedBooking) => {
    const resource = resources.find(r => r.id === booking.resourceId);
    return resource ? resource.pricePerHour : 20;
  };

  const updateFinancials = (booking: ExtendedBooking, newSeats: number, newRackets: number) => {
    const basePrice = getBasePrice(booking);

    // Calculs
    const totalCost = basePrice + (newRackets * RACKET_PRICE);
    const seatPrice = basePrice / 4;
    const amountPaid = newSeats * seatPrice;
    const newAmountDue = Math.max(0, totalCost - amountPaid);
    const newStatus = newAmountDue <= 0 ? 'paid' : 'pending';

    // Update Local
    const updatedBooking = {
      ...booking,
      paidSeats: newSeats,
      rackets: newRackets,
      amountDue: newAmountDue,
      paymentStatus: newStatus as 'paid' | 'pending' | 'partial'
    };

    setBookings(prev => prev.map(b => b.id === booking.id ? updatedBooking : b));
    setSelectedBooking(updatedBooking);

    // API Call (Simulé ici)
    // api.updateBookingStatus(booking.id, { amountDue: newAmountDue, paymentStatus: newStatus });
  };

  const handleSeatChange = (delta: number) => {
    if (!selectedBooking) return;
    const current = selectedBooking.paidSeats || 0;
    const next = Math.max(0, Math.min(4, current + delta));
    updateFinancials(selectedBooking, next, selectedBooking.rackets || 0);
  };

  const handleRacketChange = (delta: number) => {
    if (!selectedBooking) return;
    const current = selectedBooking.rackets || 0;
    const next = Math.max(0, current + delta);
    updateFinancials(selectedBooking, selectedBooking.paidSeats || 0, next);
  };

  const handleCheckIn = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, checkedIn: true } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, checkedIn: true } : null);
    api.updateBookingStatus(id, { checkedIn: true });
  };

  const handlePayFullBalance = (id: string) => {
    if (!selectedBooking) return;
    updateFinancials(selectedBooking, 4, selectedBooking.rackets || 0);
    // Force clean state
    const cleanState = { amountDue: 0, paymentStatus: 'paid' as const, paidSeats: 4 };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...cleanState } : b));
    setSelectedBooking(prev => prev ? { ...prev, ...cleanState } : null);
    api.updateBookingStatus(id, { amountDue: 0, paymentStatus: 'paid' });
  };

  // --- LOGIQUE CRÉATION ---
  const isSlotTaken = (resourceId: string, hourStr: string) => {
    const hour = parseInt(hourStr, 10);
    return bookings.some(b => {
      const bDate = new Date(b.start);
      return isSameDay(bDate, selectedDate) && bDate.getHours() === hour && b.resourceId === resourceId;
    });
  };

  const handleSlotClick = (resourceId: string, hour: number) => {
    setNewBookingData({ resourceId, hour: hour.toString() });
    setSelectedClientForBooking(null);
    setClientSearch("");
    setClientMode('search');
    setIsCreateOpen(true);
  };

  const handleQuickCreateClient = () => {
    if (!newClientData.name) return;
    const newUser: User = { id: 'u' + Date.now(), name: newClientData.name, email: newClientData.email || 'no-email', role: 'client', avatar: newClientData.name[0].toUpperCase() };
    setClients([...clients, newUser]); db.addUser(newUser);
    setSelectedClientForBooking(newUser); setClientMode('search'); setClientSearch("");
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForBooking || !newBookingData.resourceId) return alert("Sélection incomplète");

    try {
      const dateStr = formatDateForInput(selectedDate);
      const start = new Date(`${dateStr}T${newBookingData.hour}:00:00`);
      const end = new Date(`${dateStr}T${parseInt(newBookingData.hour) + 1}:00:00`);
      const resource = resources.find(r => r.id === newBookingData.resourceId);
      const price = resource ? resource.pricePerHour : 0;

      await api.createBooking({
        userId: selectedClientForBooking.id, resourceId: newBookingData.resourceId,
        start: start.toISOString(), end: end.toISOString(),
        amountDue: price, paymentStatus: 'pending',
      });
      setIsCreateOpen(false);
      await loadData();
    } catch (err: any) { alert(err.message); }
  };

  // --- RENDER HELPERS ---
  const todaysBookings = bookings.filter(b => isSameDay(new Date(b.start), selectedDate));
  const pendingAmount = todaysBookings.reduce((acc, b) => acc + (b.amountDue || 0), 0);
  const checkins = todaysBookings.filter(b => b.checkedIn).length;
  const availableResources = resources.filter(r => !isSlotTaken(r.id, newBookingData.hour));
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()));

  if (loading) return <div className="p-12 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">

      {/* HEADER AVEC NAVIGATION DATE & POPOVER CALENDRIER */}
      <PageHeader title="Planning" subtitle="Gestion des terrains">

        <div className="relative">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm mr-4">
            <button onClick={() => changeDate(-1)} className="p-2 px-3 hover:bg-slate-50 text-slate-500 border-r border-slate-100 rounded-l-xl transition-colors">←</button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 min-w-[160px] capitalize transition-colors flex items-center justify-center gap-2"
            >
              <span>📅</span> {dateLabel}
            </button>
            <button onClick={() => changeDate(1)} className="p-2 px-3 hover:bg-slate-50 text-slate-500 border-l border-slate-100 rounded-r-xl transition-colors">→</button>
          </div>

          {/* POPOVER CALENDRIER */}
          {showCalendar && (
            <div className="absolute top-full right-0 mt-2 z-50 animate-in zoom-in-95 duration-200">
              <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)}></div>
              <div className="relative z-50">
                <Calendar
                  selectedDate={selectedDate}
                  onChange={(date) => { setSelectedDate(date); setShowCalendar(false); }}
                />
              </div>
            </div>
          )}
        </div>

        <Button onClick={() => { setIsCreateOpen(true); setNewBookingData({ resourceId: '', hour: '10' }); }} className="shadow-lg shadow-indigo-200">+ Nouvelle Résa</Button>
      </PageHeader>

      {/* KPI BAR */}
      <div className="flex gap-4 mb-6">
        <StatCard label="Reste à encaisser" value={pendingAmount + '€'} iconColor="bg-orange-500" textColor={pendingAmount > 0 ? 'text-slate-800' : 'text-green-600'} />
        <StatCard label="Check-in" value={`${checkins} / ${todaysBookings.length}`} iconColor="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* GRILLE GANTT */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-6">
              <div className="grid grid-cols-[150px_repeat(12,1fr)] gap-1 mb-4 border-b border-slate-100 pb-2">
                <div className="font-bold text-xs uppercase text-slate-400 tracking-wider">Terrain</div>
                {HOURS.map(h => <div key={h} className="text-center text-xs font-bold text-slate-400">{h}h</div>)}
              </div>
              <div className="space-y-3">
                {resources.map(res => (
                  <div key={res.id} className="grid grid-cols-[150px_repeat(12,1fr)] gap-1 items-center h-12 hover:bg-slate-50 transition-colors rounded-lg px-1">
                    <div className="text-sm font-bold text-slate-700 truncate pr-2 flex flex-col">
                      <span>{res.name}</span><span className="text-[9px] text-slate-400 font-normal uppercase">{res.type}</span>
                    </div>
                    {HOURS.map(h => {
                      const booking = bookings.find(b => {
                        const bDate = new Date(b.start);
                        return b.resourceId === res.id && bDate.getHours() === h && isSameDay(bDate, selectedDate);
                      });

                      if (booking) {
                        return (
                          <div key={h} onClick={() => setSelectedBooking(booking)} className={`h-10 rounded-lg text-[10px] flex items-center justify-center font-bold cursor-pointer relative border transition-all hover:scale-105 hover:z-10 shadow-sm ${booking.checkedIn ? 'bg-slate-800 text-white border-slate-800' : booking.amountDue > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                            {booking.amountDue > 0 && !booking.checkedIn && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
                            {booking.user?.name.split(' ')[0] || 'Client'}
                          </div>
                        );
                      }
                      return (
                        <div key={h} onClick={() => handleSlotClick(res.id, h)} className="h-10 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors relative group">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-400 text-lg font-bold">+</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DETAILS */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 h-full sticky top-6 animate-in slide-in-from-right-4">
              {/* Header Sidebar */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-slate-800">Détails</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {/* Info Client */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <Avatar name={selectedBooking.user?.name || '?'} size="lg" />
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">{selectedBooking.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{selectedBooking.user?.email}</p>
                </div>
              </div>

              {/* Info Booking */}
              <div className="space-y-2 mb-6 bg-slate-50 p-4 rounded-xl text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Terrain</span><span className="font-bold text-slate-800">{selectedBooking.resourceName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-bold text-slate-800">{new Date(selectedBooking.start).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Horaire</span><span className="font-bold text-slate-800">{new Date(selectedBooking.start).getHours()}h00</span></div>
              </div>

              {/* COMPTEURS */}
              <div className="mb-6 space-y-4">
                {/* Parts Réglées */}
                <div>
                  <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold uppercase text-slate-500">Parts réglées</span><span className={`text-xs font-bold ${selectedBooking.paidSeats === 4 ? 'text-green-600' : 'text-orange-500'}`}>{selectedBooking.paidSeats}/4</span></div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-200">
                    <button onClick={() => handleSeatChange(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600">-</button>
                    <div className="flex gap-1">{[1, 2, 3, 4].map(step => (<div key={step} className={`w-2.5 h-2.5 rounded-full ${step <= (selectedBooking.paidSeats || 0) ? 'bg-green-500' : 'bg-slate-200'}`}></div>))}</div>
                    <button onClick={() => handleSeatChange(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600">+</button>
                  </div>
                </div>
                {/* Raquettes */}
                <div>
                  <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold uppercase text-slate-500">Raquettes (+{RACKET_PRICE}€)</span><span className="text-xs font-bold text-indigo-600">{selectedBooking.rackets || 0} loc.</span></div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-200">
                    <button onClick={() => handleRacketChange(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600">-</button>
                    <span className="font-bold text-slate-800">{selectedBooking.rackets || 0}</span>
                    <button onClick={() => handleRacketChange(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600">+</button>
                  </div>
                </div>
              </div>

              {/* RÉSUMÉ FINANCIER DÉTAILLÉ */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Coût Total</span>
                  <span className="font-bold text-slate-800">{(getBasePrice(selectedBooking) + ((selectedBooking.rackets || 0) * RACKET_PRICE))}€</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Déjà réglé</span>
                  <span className="font-bold text-green-600">- {((selectedBooking.paidSeats || 0) * (getBasePrice(selectedBooking) / 4))}€</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-slate-400">Reste à payer</span>
                    {selectedBooking.amountDue > 0 ? <span className="text-xs text-orange-500 font-medium">Incomplet</span> : <span className="text-xs text-green-500 font-medium">Compte bon</span>}
                  </div>
                  <span className={`text-2xl font-bold ${selectedBooking.amountDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>{selectedBooking.amountDue}€</span>
                </div>
                {selectedBooking.amountDue > 0 && <Button onClick={() => handlePayFullBalance(selectedBooking.id)} className="w-full py-2 text-sm bg-slate-900 hover:bg-slate-800 shadow-lg mt-2">💸 Encaisser le reste</Button>}
              </div>

              {!selectedBooking.checkedIn ? <Button onClick={() => handleCheckIn(selectedBooking.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">Valider Arrivée</Button> : <div className="bg-slate-800 text-white font-bold text-center py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg opacity-90"><StatusBadge variant="checkin" status={true} /></div>}
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 p-6 text-center">
              <span className="text-4xl mb-2">📅</span>
              <p className="text-sm font-bold text-slate-600 mb-1">Planning du {dateLabel}</p>
              <p className="text-xs">Cliquez sur un créneau vide</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALE CRÉATION --- */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nouvelle Réservation">
        <form onSubmit={handleCreateBooking} className="space-y-5">
          {/* CLIENT */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Client</label>
              <button type="button" onClick={() => setClientMode(clientMode === 'search' ? 'create' : 'search')} className="text-xs font-bold text-indigo-600 hover:underline">{clientMode === 'search' ? '+ Nouveau Client' : '← Rechercher'}</button>
            </div>
            {selectedClientForBooking ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-3"><Avatar name={selectedClientForBooking.name} size="sm" /><div><p className="font-bold text-sm text-slate-800">{selectedClientForBooking.name}</p><p className="text-[10px] text-slate-500">{selectedClientForBooking.email}</p></div></div>
                <button type="button" onClick={() => setSelectedClientForBooking(null)} className="text-slate-400 hover:text-red-500">✕</button>
              </div>
            ) : clientMode === 'search' ? (
              <div className="relative">
                <input type="text" placeholder="🔍 Rechercher un nom..." className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} autoFocus />
                {clientSearch && (<div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto z-10">{filteredClients.length > 0 ? filteredClients.map(c => (<div key={c.id} onClick={() => { setSelectedClientForBooking(c); setClientSearch(""); }} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center"><span className="font-medium text-slate-700">{c.name}</span><span className="text-xs text-slate-400">{c.email}</span></div>)) : (<div className="p-3 text-center text-sm text-slate-400">Aucun résultat.</div>)}</div>)}
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <input type="text" placeholder="Nom complet" className="w-full p-3 border border-slate-300 rounded-lg" value={newClientData.name} onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })} />
                <input type="email" placeholder="Email" className="w-full p-3 border border-slate-300 rounded-lg" value={newClientData.email} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} />
                <Button type="button" onClick={handleQuickCreateClient} className="w-full py-2 text-sm bg-indigo-600">Créer & Sélectionner</Button>
              </div>
            )}
          </div>

          {/* HEURE */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horaire</label>
            <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" value={newBookingData.hour} onChange={(e) => { setNewBookingData({ ...newBookingData, hour: e.target.value, resourceId: '' }); }}>
              {HOURS.map(h => <option key={h} value={h}>{h}h00 - {h + 1}h00</option>)}
            </select>
          </div>

          {/* TERRAIN */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Terrains Disponibles ({newBookingData.hour}h)</label>
            {availableResources.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableResources.map(r => (<button type="button" key={r.id} onClick={() => setNewBookingData({ ...newBookingData, resourceId: r.id })} className={`p-2 rounded-lg text-sm border text-left transition-all ${newBookingData.resourceId === r.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'}`}><div className="font-bold">{r.name}</div><div className={`text-[10px] uppercase ${newBookingData.resourceId === r.id ? 'text-indigo-200' : 'text-slate-400'}`}>{r.type}</div></button>))}
              </div>
            ) : (<div className="p-4 bg-red-50 text-red-500 text-center text-sm rounded-xl border border-red-100 font-medium">Aucun terrain disponible à {newBookingData.hour}h 😕</div>)}
          </div>

          <div className="pt-4 flex gap-3"><Button variant="secondary" onClick={() => setIsCreateOpen(false)} className="flex-1">Annuler</Button><Button disabled={!selectedClientForBooking || !newBookingData.resourceId} className="flex-1">Valider</Button></div>
        </form>
      </Modal>
    </div>
  );
}