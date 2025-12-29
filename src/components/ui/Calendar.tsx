import React, { useState, useEffect } from "react";

interface CalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onChange }) => {
  // On synchronise l'état interne si la date sélectionnée change depuis l'extérieur (flèches)
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const slots = [];

    for (let i = 0; i < firstDay; i++) slots.push(<div key={`empty-${i}`} className="h-10 w-10" />);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      // On compare les dates sans l'heure pour éviter les bugs
      const isSelected = dateToCheck.toDateString() === selectedDate.toDateString();
      const isToday = dateToCheck.toDateString() === new Date().toDateString();

      slots.push(
        <button
          key={i}
          onClick={() => onChange(dateToCheck)}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
            ${isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-110" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"}
            ${isToday && !isSelected ? "border border-indigo-200 text-indigo-600 font-bold" : ""}
          `}
        >
          {i}
        </button>
      );
    }
    return slots;
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 w-[320px]">
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors">←</button>
        <h3 className="font-bold text-slate-800 text-sm capitalize">{months[currentDate.getMonth()]} <span className="text-slate-400 font-normal">{currentDate.getFullYear()}</span></h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors">→</button>
      </div>
      <div className="grid grid-cols-7 mb-2 text-center">{days.map((day) => (<div key={day} className="text-xs font-bold text-slate-400 py-1">{day}</div>))}</div>
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">{renderDays()}</div>
    </div>
  );
};