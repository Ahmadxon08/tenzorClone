// src/pages/AdminDashboard/Companies/CompanyOverview.tsx
import { Building2, Globe2, Server, Mail } from "lucide-react";

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

export default function CompanyOverview({ company }: Props) {
  const stats = [
    {
      icon: Building2,
      label: "Company ID",
      value: company.company_id,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Mail,
      label: "Email",
      value: company.company_email,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Server,
      label: "Total Sites",
      value: company.site_count,
      color: "from-green-500 to-green-600"
    },
    {
      icon: Globe2,
      label: "Total Domains",
      value: company.domain_count,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg p-3 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-white truncate">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
