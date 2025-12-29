import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { db } from '../../../mocks/database';
import type { ExtendedBooking, Resource, User } from '../../../types';

// UI
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/admin/ui/PageHeader';
import { StatCard } from '../../../components/admin/ui/StatCard';

// FEATURES
import DateNavigator from '../components/DateNavigator';
import BookingSidebar from '../components/BookingSidebar';
import UnpaidModal from '../components/UnpaidModal';
import CreateBookingModal from '../components/CreateBookingModal';

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export default function PlanningView() {
  // 1. DATA STATE
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. UI STATE
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUnpaidOpen, setIsUnpaidOpen] = useState(false);
  const [createData, setCreateData] = useState({ resourceId: '', hour: '10' });

  // --- CHARGEMENT ---
  const loadData = async () => {
    try {
      const [bData, rData] = await Promise.all([api.getAllBookingsWithDetails(), api.getResources()]);
      setBookings(bData.map(b => ({ ...b, paidSeats: b.amountDue === 0 ? 4 : 0, rackets: 0 })));
      setResources(rData);
      setClients(db.users.filter(u => u.role === 'client'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  // --- HELPERS ---
  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

  // --- HANDLERS ---
  const handleUpdateBooking = (id: string, updates: Partial<ExtendedBooking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleCreateClient = (userData: Partial<User>) => {
    const newUser: User = {
      id: 'u' + Date.now(),
      role: 'client',
      name: userData.name || 'Sans nom',
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: userData.name ? userData.name[0].toUpperCase() : '?',
      ...userData
    } as User;

    setClients([...clients, newUser]);
    db.addUser(newUser);
    return newUser;
  };

  // Création avec DATE personnalisée
  const handleCreateBooking = async (userId: string, resourceId: string, hour: string, date: string) => {
    // On utilise la date renvoyée par le formulaire (format YYYY-MM-DD)
    const start = new Date(`${date}T${hour}:00:00`);
    const end = new Date(`${date}T${parseInt(hour) + 1}:00:00`);
    const price = resources.find(r => r.id === resourceId)?.pricePerHour || 0;

    await api.createBooking({ userId, resourceId, start: start.toString(), end: end.toString(), amountDue: price, paymentStatus: 'pending' });
    setIsCreateOpen(false);
    await loadData();
  };

  // --- CALCULS STATS ---
  const todaysBookings = bookings.filter(b => isSameDay(new Date(b.start), selectedDate));
  const unpaidBookings = todaysBookings.filter(b => b.amountDue > 0);
  const totalPending = unpaidBookings.reduce((acc, b) => acc + (b.amountDue || 0), 0);
  const checkins = todaysBookings.filter(b => b.checkedIn).length;

  // --- RENDER ---
  if (loading) return <div className="p-12 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="animate-in fade-in relative min-h-screen pb-20">

      {/* HEADER */}
      <PageHeader title="Planning" subtitle="Vue Journalière">
        <div className="flex gap-4">
          <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
          <Button onClick={() => { setCreateData({ resourceId: '', hour: '10' }); setIsCreateOpen(true); }}>+ Nouvelle Résa</Button>
        </div>
      </PageHeader>

      {/* KPI */}
      <div className="flex gap-4 mb-6">
        <StatCard
          label="Reste à encaisser" value={totalPending + '€'}
          iconColor="bg-orange-500" textColor={totalPending > 0 ? 'text-slate-800' : 'text-green-600'}
          onClick={() => setIsUnpaidOpen(true)}
        />
        <StatCard label="Check-in" value={`${checkins} / ${todaysBookings.length}`} iconColor="bg-indigo-600" />
      </div>

      {/* GRILLE GANTT */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 overflow-x-auto">
        <div className="grid grid-cols-[150px_repeat(12,1fr)] gap-2 mb-4 border-b pb-2">
          <div className="font-bold text-xs text-slate-400">TERRAIN</div>
          {HOURS.map(h => <div key={h} className="text-center text-xs font-bold text-slate-400">{h}h</div>)}
        </div>
        <div className="space-y-3 min-w-[800px]">
          {resources.map(res => (
            <div key={res.id} className="grid grid-cols-[150px_repeat(12,1fr)] gap-2 h-12 items-center">
              <span className="font-bold text-sm text-slate-700">{res.name}</span>
              {HOURS.map(h => {
                const booking = bookings.find(b => b.resourceId === res.id && new Date(b.start).getHours() === h && isSameDay(new Date(b.start), selectedDate));
                if (booking) {
                  const color = booking.amountDue <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800';
                  return (<div key={h} onClick={() => setSelectedBooking(booking)} className={`h-10 rounded-lg text-[10px] flex items-center justify-center font-bold cursor-pointer border ${color}`}>{booking.user?.name.split(' ')[0]}</div>);
                }
                return (<div key={h} onClick={() => { setCreateData({ resourceId: res.id, hour: h.toString() }); setIsCreateOpen(true); }} className="h-10 rounded-lg bg-slate-50 hover:bg-indigo-50 cursor-pointer relative group"><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-500 font-bold">+</div></div>);
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MODALES & DRAWER */}
      <BookingSidebar
        booking={selectedBooking}
        resource={resources.find(r => r.id === selectedBooking?.resourceId)}
        onClose={() => setSelectedBooking(null)}
        onUpdate={handleUpdateBooking}
      />

      <UnpaidModal
        isOpen={isUnpaidOpen}
        onClose={() => setIsUnpaidOpen(false)}
        bookings={unpaidBookings}
        totalPending={totalPending}
        onSelectBooking={(b) => { setSelectedBooking(b); setIsUnpaidOpen(false); }}
      />

      <CreateBookingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        clients={clients}
        resources={resources}
        bookings={bookings} // <--- AJOUTEZ CETTE LIGNE
        initialDate={selectedDate}
        preselectedData={createData}
        onCreateClient={handleCreateClient}
        onCreateBooking={handleCreateBooking}
      />

    </div>
  );
}