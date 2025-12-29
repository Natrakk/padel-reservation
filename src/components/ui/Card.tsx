export const Card: React.FC<{
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}> = ({ children, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-2xl border transition-all duration-300 cursor-pointer group
        ${
          selected
            ? "border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-600 ring-offset-2"
            : "border-white bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
        }
      `}
    >
      {children}
    </div>
  );
};
