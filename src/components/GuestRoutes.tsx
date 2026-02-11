import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = "/dashboard",
}) => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !initializing && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, initializing, isReady, navigate, redirectTo]);

  if (!isReady || initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; 
  }

  return <>{children}</>;
};

export default GuestRoute;