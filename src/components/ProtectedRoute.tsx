// src/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BlockedOverlay from "./BlockedOverlay";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, token, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="ball relative">
          <div className="ball1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <style>{`
    .ball {
      background-color: rgba(0,0,0,0);
      border: 5px solid rgba(0,183,229,0.9);
      border-top: 5px solid rgba(0,0,0,0);
      border-left: 5px solid rgba(0,0,0,0);
      border-radius: 130px;
      box-shadow: 0 0 35px #2187e7;
      width: 130px;
      height: 130px;
      margin: 0 auto;
      -moz-animation: spin 1.5s infinite linear;
      -webkit-animation: spin 1.5s infinite linear;
      animation: spin 1.5s infinite linear;
    }

    .ball1 {
      background-color: rgba(0,0,0,0);
      border: 5px solid rgba(0,183,229,0.9);
      border-top: 5px solid rgba(0,0,0,0);
      border-left: 5px solid rgba(0,0,0,0);
      border-radius: 98px;
      box-shadow: 0 0 15px #2187e7;
      width: 98px;
      height: 98px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      -moz-animation: spinoff .75s infinite linear;
      -webkit-animation: spinoff .75s infinite linear;
      animation: spinoff .75s infinite linear;
    }

    @-moz-keyframes spin {
      0% { -moz-transform: rotate(0deg); }
      100% { -moz-transform: rotate(360deg); }
    }
    @-moz-keyframes spinoff {
      0% { -moz-transform: rotate(0deg); }
      100% { -moz-transform: rotate(-360deg); }
    }
    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }
    @-webkit-keyframes spinoff {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(-360deg); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spinoff {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }
  `}</style>
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.status === false) {
    return <BlockedOverlay />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
