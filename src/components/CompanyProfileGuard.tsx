import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "./Loading";

const CompanyProfileGuard = () => {
  const { user, initializing } = useAuth();
  const location = useLocation();
  const requiredFields = [
    "companyName",
    "companyPhone",
    "description",
    "latitude",
    "longitude",
    "messageTemplate",
    "location",
  ];

  const missingFields = user
    ? requiredFields.filter(
        (field) =>
          !user[field as keyof typeof user] ||
          user[field as keyof typeof user] === "",
      )
    : requiredFields;

  const hasAllData = missingFields.length === 0;

  if (initializing) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasAllData && !location.pathname.startsWith("/dashboard/settings")) {
    return (
      <Navigate
        to="/dashboard/settings"
        replace
        state={{
          fromGuard: true,
          missingFields,
        }}
      />
    );
  }

  return <Outlet />;
};

export default CompanyProfileGuard;
