import { db } from "../mocks/database";
import type { User } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  login: async (email: string): Promise<User> => {
    await delay(600);
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) return user;

    // Si pas trouvé pour la démo, on rejette (ou on pourrait auto-créer)
    throw new Error(
      "Utilisateur inconnu. Essayez 'admin@padel.com' ou 'jean@demo.com'"
    );
  },

  register: async (email: string, name: string): Promise<User> => {
    await delay(800);
    const exists = db.users.find((u) => u.email === email);
    if (exists) throw new Error("Cet email existe déjà.");

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: "client", // Par défaut
      avatar: "😊",
    };

    db.addUser(newUser);
    return newUser;
  },
};
