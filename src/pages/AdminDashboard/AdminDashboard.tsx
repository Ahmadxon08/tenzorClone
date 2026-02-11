import React from "react";
import { Users, Briefcase, FileText } from "lucide-react";
import { t } from "i18next";

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        {t("adminDashboard.title")}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10
    shadow-2xl rounded-2xl p-6
    flex items-center gap-3
  "
        >
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Users size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.stats.pendingRequests.label")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">123</p>
          </div>
        </div>

        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10
    shadow-2xl rounded-2xl p-6
    flex items-center gap-3
  "
        >
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Briefcase size={32} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.stats.activeJobs.label")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">45</p>
          </div>
        </div>

        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10
    shadow-2xl rounded-2xl p-6
    flex items-center gap-3
  "
        >
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <FileText size={32} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.stats.pendingRequests.label")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
