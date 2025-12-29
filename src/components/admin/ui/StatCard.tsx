interface StatCardProps {
    label: string;
    value: string | number;
    iconColor?: string;
    textColor?: string;
    onClick?: () => void; // <--- Ajout
}

export const StatCard = ({ label, value, iconColor = 'bg-indigo-600', textColor = 'text-slate-800', onClick }: StatCardProps) => (
    <div
        onClick={onClick}
        className={`
      bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all
      ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md active:scale-95' : ''}
    `}
    >
        <div className={`w-2 h-2 rounded-full ${iconColor}`}></div>
        <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{label}</span>
            <span className={`font-bold ${textColor}`}>{value}</span>
        </div>
    </div>
);