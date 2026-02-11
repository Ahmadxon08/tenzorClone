import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, FileText, Globe, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { Application } from "../../types";

interface StatsCardsProps {
  vacanciesCount: number;
  loading?: boolean;
  onRefresh?: () => void;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  gradient: string;
}> = ({ title, value, icon, hint, gradient }) => (
  <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-xl border border-white/10 p-5 hover:border-blue-500/30 transition-all duration-300 group">
    <div className="flex items-start gap-4">
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {hint && <p className="text-xs text-gray-500 font-medium">{hint}</p>}
        </div>
      </div>
    </div>
  </div>
);

const StatsCards: React.FC<StatsCardsProps> = ({
  vacanciesCount,
  loading,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const userData = localStorage.getItem("user");
  const parsedUserData = userData ? JSON.parse(userData) : null;
  const public_key =
    parsedUserData?.sites?.[0]?.public_key || "JhwH4LrDLnVgQ3GC";
  const site_domain = parsedUserData?.sites?.[0]?.site_domain || "";

  useEffect(() => {
    if (token) {
      loadApplications();
    }
  }, [token]);

  const loadApplications = async () => {
    if (!token) return;
    setLoadingApps(true);
    try {
      const data = await apiService.getApplications(
        token,
        public_key,
        site_domain
      );
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const unseenCount = applications.filter((app: any) => app.is_new).length;
  const totalCount = applications.length;

  return (
    <div className="xl:col-span-1 xl:sticky xl:top-20 h-max bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {t("statsCards.title")}
        </h2>
        <button
          aria-label={t("statsCards.refreshAria")}
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#0a1b30]/50 hover:bg-[#0a1b30]/70 border border-white/10 rounded-lg transition-all disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("statsCards.refreshButton")}
        </button>
      </div>

      {/* Total Applications */}
      <MetricCard
        title={t("statsCards.totalVacancies.title")}
        value={loading ? "—" : totalCount}
        icon={<Briefcase className="h-6 w-6 text-blue-400" />}
        gradient="from-blue-500/20 to-blue-600/20"
      />

      {/* NEW: Vacancies Count */}
      <MetricCard
        title={t("statsCards.vacanciesCount.title")}
        value={loading ? "—" : vacanciesCount}
        icon={<Users className="h-6 w-6 text-cyan-400" />}
        gradient="from-cyan-500/20 to-cyan-600/20"
      />

      {/* New Applications */}
      <MetricCard
        title={t("statsCards.newApplications.title")}
        value={loading || loadingApps ? "—" : unseenCount}
        icon={<FileText className="h-6 w-6 text-green-400" />}
        gradient="from-green-500/20 to-green-600/20"
      />

      {/* Widget Status */}
      <MetricCard
        title={t("statsCards.widgetStatus.title")}
        value={t("statsCards.widgetStatus.value")}
        icon={<Globe className="h-6 w-6 text-purple-400" />}
        hint={t("statsCards.widgetStatus.hint")}
        gradient="from-purple-500/20 to-purple-600/20"
      />

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-xs text-gray-500">
          {t("statsCards.lastUpdate.prefix")}
          <span className="font-medium text-gray-400">
            {t("statsCards.lastUpdate.time")}
          </span>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default StatsCards;
