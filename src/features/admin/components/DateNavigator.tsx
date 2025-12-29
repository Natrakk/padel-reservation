import { Calendar } from '../../../components/ui/Calendar'; // Ton Calendar existant
import { useState } from 'react';

interface Props {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

export default function DateNavigator({ selectedDate, onChange }: Props) {
    const [showCalendar, setShowCalendar] = useState(false);

    const changeDay = (delta: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        onChange(d);
    };

    const label = selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="relative">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm">
                <button onClick={() => changeDay(-1)} className="p-2 px-3 hover:bg-slate-50 border-r border-slate-100 text-slate-500 rounded-l-xl">←</button>
                <button onClick={() => setShowCalendar(!showCalendar)} className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 min-w-[140px] capitalize">
                    📅 {label}
                </button>
                <button onClick={() => changeDay(1)} className="p-2 px-3 hover:bg-slate-50 border-l border-slate-100 text-slate-500 rounded-r-xl">→</button>
            </div>

            {showCalendar && (
                <div className="absolute top-full mt-2 left-0 z-50 animate-in zoom-in-95">
                    <div className="fixed inset-0" onClick={() => setShowCalendar(false)}></div>
                    <div className="relative z-50">
                        <Calendar selectedDate={selectedDate} onChange={(d) => { onChange(d); setShowCalendar(false); }} />
                    </div>
                </div>
            )}
        </div>
    );
}