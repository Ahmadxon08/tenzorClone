// layouts/DashboardLayout.tsx
import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, X } from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Sidebar from "../components/dashboard/Sidebar";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const displayUser = user || {
    organization_name: "Tashkilot",
    site_name: "Sayt",
    email: "email@example.com",
    site_domain: "https://example.com",
    public_key: "DEFAULT_KEY",
    organization_language: "uz",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (tab: string) => {
    navigate(`/dashboard/${tab}`);
  };

  const isInterviewRoute = useMemo(
    () => pathname.startsWith("/dashboard/interview"),
    [pathname]
  );

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row ${isInterviewRoute ? "bg-[#020611]" : ""
        }`}
      style={{
        background:
          "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
      }}
    >
      {!isInterviewRoute && (
        <Sidebar
          onLogout={handleLogout}
          user={displayUser}
          activeTab={pathname}
          onTabChange={handleTabChange}
          isMobileOpen={isSidebarOpen}
          onMobileClose={handleSidebarClose}
        />
      )}

      <div className="flex-1 flex flex-col w-full">
        {!isInterviewRoute && (
          <DashboardHeader
            user={displayUser}
            onSidebarToggle={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        <main className={`flex-1 ${isInterviewRoute ? "" : "p-6 sm:p-8"}`}>
          {isInterviewRoute ? (
            <Outlet />
          ) : (
            <div className="max-w-[1440px] mx-auto">
              {error && (
                <div className="mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <p className="text-sm flex-1 font-medium">{error}</p>
                    <button
                      onClick={() => setError("")}
                      className="text-red-400 hover:text-red-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
