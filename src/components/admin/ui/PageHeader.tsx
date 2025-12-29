interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode; // Pour les boutons d'action ou searchbar
}

export const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-in fade-in slide-in-from-top-2">
        <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {children}
        </div>
    </div>
);