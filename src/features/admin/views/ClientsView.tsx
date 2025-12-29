import { useState, useEffect } from "react";
import { db } from "../../../mocks/database"; // Accès direct mock DB pour démo
import type { User } from "../../../types";

export default function ClientsView() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Simulation appel API
    setTimeout(() => {
      setUsers(db.users.filter((u) => u.role === "client"));
    }, 300);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
            <th className="p-4 font-bold">Client</th>
            <th className="p-4 font-bold">Email</th>
            <th className="p-4 font-bold">Statut</th>
            <th className="p-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <td className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-700">{user.name}</span>
              </td>
              <td className="p-4 text-slate-500 text-sm">{user.email}</td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                  Actif
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="text-indigo-600 hover:underline text-sm font-medium">
                  Voir fiche
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
