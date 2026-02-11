import React from "react";
import { Menu } from "lucide-react";
import LanguageSelector from "../LanguageSelector";

interface DashboardHeaderProps {
  user: {
    organization_name?: string;
    site_name?: string;
    email?: string;
  };

  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onSidebarToggle,
  // isSidebarOpen = false
}) => {
  return (
    <>
      <header className="bg-gradient-to-r from-[#0a1b30]/80 to-[#071226]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg shadow-black/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left Section - Menu Toggle + Organization Info */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={onSidebarToggle}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Organization Info */}
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  {user.organization_name}
                </h1>
                <p className="text-xs text-gray-400 truncate">
                  {user.site_name}
                </p>
              </div>
            </div>

            {/* Right Section - Email, Language, Logout */}
            <div className="flex items-center gap-2 sm:gap-3 ml-4">
              {/* Email Display - Hidden on small screens */}

              {/* Language Selector - Hidden on extra small screens */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Logout Button */}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
    </>
  );
};

export default DashboardHeader;
