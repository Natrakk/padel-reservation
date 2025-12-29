import React, { useState } from "react";

interface CalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  // Noms des jours et mois en Français
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Dimanche, 1 = Lundi... on veut que Lundi soit 0 pour notre grid
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const slots = [];

    // Cases vides avant le 1er du mois
    for (let i = 0; i < firstDay; i++) {
      slots.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      const dateToCheck = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const isSelected =
        dateToCheck.toDateString() === selectedDate.toDateString();
      const isToday = dateToCheck.toDateString() === new Date().toDateString();

      slots.push(
        <button
          key={i}
          onClick={() => onChange(dateToCheck)}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
            ${
              isSelected
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-110"
                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }
            ${
              isToday && !isSelected
                ? "border border-indigo-200 text-indigo-600 font-bold"
                : ""
            }
          `}
        >
          {i}
        </button>
      );
    }
    return slots;
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-[340px] mx-auto">
      {/* Header Mois + Navigation */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
        >
          ←
        </button>
        <h3 className="font-bold text-slate-800 text-lg capitalize">
          {months[currentDate.getMonth()]}{" "}
          <span className="text-slate-400 font-normal">
            {currentDate.getFullYear()}
          </span>
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
        >
          →
        </button>
      </div>

      {/* Jours de la semaine (L M M J V S D) */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {days.map((day) => (
          <div key={day} className="text-xs font-bold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des numéros */}
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {renderDays()}
      </div>
    </div>
  );
};
