interface StatusBadgeProps {
    variant: 'payment' | 'checkin' | 'active' | 'custom';
    status?: 'paid' | 'pending' | 'partial' | boolean; // boolean pour checkin
    label?: string; // Texte forcé (ex: montant dû)
}

export const StatusBadge = ({ variant, status, label }: StatusBadgeProps) => {
    let styles = "bg-slate-100 text-slate-600";
    let text = label;

    if (variant === 'payment') {
        if (status === 'paid') {
            styles = "bg-green-50 text-green-600 border-green-100";
            text = text || "Payé";
        } else {
            styles = "bg-orange-50 text-orange-600 border-orange-100";
            text = text || "Impayé"; // Sera souvent écrasé par le montant
        }
    }
    else if (variant === 'checkin') {
        if (status === true) { // Checked in
            styles = "bg-slate-800 text-white border-slate-800";
            text = text || "Présent";
        } else {
            styles = "bg-slate-100 text-slate-500 border-slate-200";
            text = text || "Attente";
        }
    }
    else if (variant === 'active') {
        styles = "bg-green-50 text-green-600 border-green-100";
        text = "Actif";
    }

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles} inline-flex items-center gap-1`}>
            {variant === 'checkin' && status === true && <span>✓</span>}
            {text}
        </span>
    );
};