import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, initializing, logout } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!token || !user || isTokenExpired(token)) {
      logout();
      setRedirect(true);
    }
  }, [token, user, logout]);

  if (initializing) return <div>Loading...</div>;
  if (redirect) return <Navigate to="/login" replace />;

  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return <>{children}</>;
};
