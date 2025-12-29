// 1. AJOUTE CET IMPORT EN HAUT
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  // 2. REMPLACE 'JSX.Element' PAR 'React.ReactNode'
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. Cast explicite si nécessaire, ou retour direct (ReactNode est compatible)
  return <>{children}</>;
}
