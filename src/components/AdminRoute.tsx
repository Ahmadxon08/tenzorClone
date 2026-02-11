// src/components/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, initializing } = useAuth();

  if (initializing) return <div>Loading Admin...</div>; // Replace with your ball spinner

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
