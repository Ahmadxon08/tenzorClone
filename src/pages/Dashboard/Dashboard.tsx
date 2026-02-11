import React, { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Globe,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sitesOpen, setSitesOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0f172a] flex text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a1b30] border-r border-white/10 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/dashboard" className="text-xl font-bold text-white">
            JobX
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>{t("dashboard.menu.dashboard") || "Dashboard"}</span>
          </NavLink>

          <NavLink
            to="/dashboard/vacancies"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Briefcase size={20} />
            <span>{t("dashboard.menu.vacancies") || "Vakansiyalar"}</span>
          </NavLink>

          <NavLink
            to="/dashboard/applications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <FileText size={20} />
            <span>{t("dashboard.menu.applications") || "Arizalar"}</span>
          </NavLink>

          <NavLink
            to="/dashboard/test"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <FileText size={20} />
            <span>{t("dashboard.menu.tests") || "Testlar"}</span>
          </NavLink>

          <NavLink
            to="/dashboard/results"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Award size={20} />
            <span>{t("dashboard.menu.results") || "Natijalar"}</span>
          </NavLink>

          {/* Sites Section */}
          <div className="pt-4">
            <button
              onClick={() => setSitesOpen(!sitesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300"
            >
              {t("dashboard.menu.sites") || "Saytlar"}
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  sitesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            
            {sitesOpen && (
              <div className="mt-1 space-y-1">
                {user?.sites?.map((site, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white truncate"
                  >
                    <Globe size={16} />
                    <span className="truncate">{site.site_domain || site.site_name || "Untitled Site"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Settings size={20} />
            <span>{t("dashboard.menu.settings") || "Sozlamalar"}</span>
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>{t("dashboard.menu.logout") || "Chiqish"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#0a1b30] border-b border-white/10 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 text-lg font-bold text-white">JobX</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;