import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const CompanyProfileGuard = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0f1d] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default CompanyProfileGuard;

// import { useAuth } from "../contexts/AuthContext";
// import { Navigate, Outlet, useLocation } from "react-router-dom";

// const REQUIRED_FIELDS = [
//   "company_name",
//   "company_phone",
//   "description",
//   "message_template",
//   "location",
// ];

// const CompanyProfileGuard = () => {
//   const { user, initializing } = useAuth();
//   const location = useLocation();

//   // const allfields = user ? REQUIRED_FIELDS.every((e) => e in user) : false;
//   if (initializing) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#0a0f1d] text-white">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
//       </div>
//     );
//   }

//   // Find exactly which fields are missing or empty
//   const missingFields = user
//     ? REQUIRED_FIELDS.filter(
//         (field) =>
//           !user[field as keyof typeof user] ||
//           user[field as keyof typeof user] === "",
//       )
//     : REQUIRED_FIELDS;

//   const hasAllFields = missingFields.length === 0;

//   if (!hasAllFields && location.pathname !== "/dashboard/settings") {
//     return (
//       <Navigate
//         to="/dashboard/settings"
//         replace
//         state={{
//           fromGuard: true,
//           missingFields: missingFields,
//         }}
//       />
//     );
//   }

//   return <Outlet />;
// };

// export default CompanyProfileGuard;
