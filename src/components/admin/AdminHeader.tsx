import React, { useState } from "react";
import { LogOut, Mail, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCancel = () => setShowLogoutModal(false);
  const handleConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#0a1b30]/80 to-[#071226]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg shadow-black/10">
        <div className="w-full px-15">
          <div className="flex justify-between items-center h-20">
            {/* LEFT */}
            <div>
              <h1 className="text-lg font-bold text-white">
                {t("adminDashboard.header.title")}
              </h1>
              <p className="text-xs text-gray-400">
                {t("adminDashboard.header.subtitle")}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              {/* Email */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a1b30]/50 border border-white/10">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {user?.email || "admin@example.com"}
                </span>
              </div>

              {/* Language */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 
                hover:text-white bg-[#0a1b30]/50 hover:bg-red-500/20 
                border border-white/10 hover:border-red-500/30 
                rounded-xl transition-all cursor-pointer group"
              >
                <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
                <span className="hidden sm:inline">{t("navbar.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 rounded-2xl 
            shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {t("adminDashboard.header.logoutModal.title")}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-300 mb-8">
              {t("adminDashboard.header.logoutModal.message")}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-300 
                bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                {t("adminDashboard.header.logoutModal.cancel")}
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 text-sm font-medium text-white 
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                {t("adminDashboard.header.logoutModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
