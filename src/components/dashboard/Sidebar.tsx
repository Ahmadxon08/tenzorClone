// components/dashboard/Sidebar.tsx
import {
  BarChart3,
  Briefcase,
  FileText,
  Settings,
  LayoutTemplate,
  MessageCircleCode,
  ClipboardList,
  X,
  Mail,
  LogOut,
} from "lucide-react";
import { useState, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import jobX from "../../assets/logo/jobX.png";
// import { apiService } from "../../services/api";
// import { useQuery } from "@tanstack/react-query";
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout: () => void;
  user: any;
}

// interface Application {
//   id: number;
//   name: string;
//   phonenumber: string;
//   resume: string;
//   score: number;
//   site_name: string;
//   vakansiya_title: string | null;
// }
// nmadur
const Sidebar: FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isMobileOpen = false,
  onMobileClose = () => { },
  onLogout,
  user,
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0)

  const menuItems = [
    {
      id: "vacancies",
      id_active: "/dashboard/vacancies",
      label: t("sidebar.vacancies"),
      icon: Briefcase,
    },
    {
      id: "applications",
      id_active: "/dashboard/applications",
      label: t("sidebar.applications"),
      icon: FileText,
      badge: "12",
    },
    {
      id: "sites",
      id_active: "/dashboard/sites",
      label: t("sidebar.sites"),
      icon: LayoutTemplate,
    },
    {
      id: "statistics",
      id_active: "/dashboard/statistics",
      label: t("sidebar.statistics"),
      icon: BarChart3,
    },
    {
      id: "test",
      id_active: "/dashboard/test",
      label: "Test",
      icon: MessageCircleCode,
    },
    {
      id: "results",
      id_active: "/dashboard/results",
      label: t("sidebar.results"),
      icon: ClipboardList,
    },
    {
      id: "settings",
      id_active: "/dashboard/settings",
      label: t("sidebar.settings"),
      icon: Settings,
    },
  ];

  useEffect(() => {
    if (token) {
      loadApplications();
    }
  }, [token]);

  // Handle body overflow for mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const userData = localStorage.getItem("user");
  const parsedUserData = userData ? JSON.parse(userData) : null;
  const public_key =
    parsedUserData?.sites?.[0]?.public_key || "JhwH4LrDLnVgQ3GC";
  const site_domain = parsedUserData?.sites?.[0]?.site_domain || "";

  const loadApplications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await apiService.getApplicationsCountBySite(
        token,
        public_key,
        site_domain
      );
      setUnseenCount(data.total)
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemClick = (tab: string) => {
    onTabChange(tab);
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-72 bg-gradient-to-b from-[#0a1b30]/80 to-[#071226]/80 backdrop-blur-xl 
        border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:z-auto z-50
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <nav className="flex flex-col h-full">
          <div className="p-6 pb-2">
            <a href="https://jobx.uz" className="flex flex-1 justify-center ">
              <img className="w-25" src={jobX} alt="JobX" />
            </a>
            <button
              onClick={onMobileClose}
              className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id_active;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full cursor-pointer flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                    ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white font-semibold border border-blue-500/30 shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${isActive
                        ? "text-blue-400"
                        : "text-gray-400 group-hover:text-blue-400"
                        } transition-colors`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>

                  {!loading && item.id === "applications" && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ${unseenCount > 0
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30 animate-pulse"
                        : "bg-gray-600 text-gray-200"
                        }`}
                    >
                      {unseenCount}
                    </span>
                  )
                  }
                </button>
              );
            })}
          </div>

          <div className="p-6 mt-auto border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm text-gray-300 truncate font-medium">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group border border-transparent hover:border-red-500/20"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <LogOut className="h-4 w-4 group-hover:text-red-400" />
              </div>
              <span>{t("navbar.logout")}</span>
            </button>
          </div>
        </nav>
      </aside >
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCancelLogout}
        >
          <div
            className="bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {t("dashboardHeader.logoutModal.title")}
              </h3>
              <button
                onClick={handleCancelLogout}
                className="p-2 hover:bg-white/10 cursor-pointer rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm sm:text-base text-gray-300">
                {t("dashboardHeader.logoutModal.message")}
              </p>
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                {t("dashboardHeader.logoutModal.cancel")}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                {t("dashboardHeader.logoutModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )
      }
    </>
  );
};

export default Sidebar;
