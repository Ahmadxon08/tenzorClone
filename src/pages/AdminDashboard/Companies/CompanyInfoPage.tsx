// src/pages/AdminDashboard/Companies/CompanyInfoPage.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";
// import { Toaster } from "@/components/ui/sonner";
import CompanyCard from "./CompanyCard";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import { t } from "i18next";

type CompanyInfoResponse = {
  company_id: number;
  company_email: string;
  domain_count: number;
  site_count: number;
  sites: {
    site_id: number;
    site_name: string;
    domains: any[];
  }[];
};

export default function CompanyInfoPage() {
  const { token } = useAuth();
  const [data, setData] = useState<CompanyInfoResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCompanyInfo = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await apiService.getCompanyInfo(token);
      setData(response);
      toast.success(t("adminDashboard.companyPage.messages.loadSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("adminDashboard.companyPage.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyInfo();
  }, [token]);

  return (
    <>
      {/* <Toaster /> */}
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              {t("adminDashboard.companyPage.title")}
            </h1>
            <p className="text-xs text-gray-400">
              {loading
                ? "Loading..."
                : `${data.length} ${
                    data.length === 1 ? "company" : "companies"
                  } found`}
            </p>
          </div>

          <button
            onClick={loadCompanyInfo}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("adminDashboard.companyPage.refresh")}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-[140px] w-full bg-white/5 rounded-lg"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg p-8 text-center">
            <p className="text-gray-400 text-sm">
              {t("adminDashboard.companyPage.noData")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((company) => (
              <CompanyCard key={company.company_id} company={company} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
