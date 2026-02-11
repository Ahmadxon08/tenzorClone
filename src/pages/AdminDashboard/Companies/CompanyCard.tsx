// src/pages/AdminDashboard/Companies/CompanyCard.tsx

import { useState } from "react";
import { Building2, Mail, ChevronDown, ChevronUp } from "lucide-react";
import CompanyOverview from "./CompanyOverview";
import SitesChart from "./SitesChart";
import DomainsBreakdown from "./DomainsBreakdown";

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

type Props = {
  company: CompanyInfoResponse;
};

export default function CompanyCard({ company }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header Section */}
      <div
        className="p-6 cursor-pointer hover:bg-white/5 transition-colors w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between w-full">
          {/* Left Section: Icon + Company Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                Company #{company.company_id}
              </h2>

              <div className="flex items-center gap-2 text-gray-400 min-w-0 truncate">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{company.company_email}</span>
              </div>
            </div>
          </div>

          {/* Stats + Chevron */}
          <div className="flex items-center gap-6 flex-shrink-0 ml-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {company.site_count}
              </p>
              <p className="text-sm text-gray-400">Sites</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {company.domain_count}
              </p>
              <p className="text-sm text-gray-400">Domains</p>
            </div>

            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-white" />
              ) : (
                <ChevronDown className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-white/10 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <CompanyOverview company={company} />
          <SitesChart sites={company.sites} />
          <DomainsBreakdown sites={company.sites} />
        </div>
      )}
    </div>
  );
}
