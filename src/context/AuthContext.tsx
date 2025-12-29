import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/auth"; // Assurez-vous que l'import est bon
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  // ICI : On supprime 'name' des arguments, login ne prend que l'email
  login: (email: string) => Promise<boolean>;
  register: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string) => {
    try {
      const loggedUser = await authService.login(email);
      setUser(loggedUser);
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const register = async (email: string, name: string) => {
    try {
      const newUser = await authService.register(email, name);
      setUser(newUser);
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
