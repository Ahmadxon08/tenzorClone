import {
  Users,
  Settings,
  LayoutDashboard,
  FileText,
  Building2,
  Inbox,
} from "lucide-react";

import React from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      path: "/admin/adminApplications",
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      path: "/admin/adminCompanies",
    },
    { id: "requests", label: "Requests", icon: Inbox, path: "/admin/requests" },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/adminSettings",
    },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-[#0a1b30]/80 to-[#071226]/80 backdrop-blur-xl border-r border-white/10 min-h-screen max-h-screen sticky top-0">
      <nav className="p-6 space-y-2">
        <a href="https://jobx.uz">
          <h1 className="cursor-pointer text-4xl font-bold text-white leading-tight pb-6 px-2 hover:scale-105 transition-transform">
            JOB
            <span
              className="inline-block text-5xl bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-pulse"
              style={{
                transform: "rotateY(-25deg) skewY(-10deg)",
                display: "inline-block",
              }}
            >
              X
            </span>
          </h1>
        </a>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;

            return (
              <button
                key={item.path}
                onClick={() => onTabChange(item.path)}
                className={`w-full cursor-pointer flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white font-semibold border border-blue-500/30 shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      isActive
                        ? "text-blue-400"
                        : "text-gray-400 group-hover:text-blue-400"
                    } transition-colors`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
