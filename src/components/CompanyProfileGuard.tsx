import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";

const CompanyProfileGuard = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default CompanyProfileGuard;
