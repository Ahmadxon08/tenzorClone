// src/pages/AdminDashboard/Companies/DomainsBreakdown.tsx
import { Globe, TrendingUp } from "lucide-react";

type Site = {
  site_id: number;
  site_name: string;
  domains: any[];
};

type Props = {
  sites: Site[];
};

export default function DomainsBreakdown({ sites }: Props) {
  const totalDomains = sites.reduce((sum, site) => sum + site.domains.length, 0);

  return (
    <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Sites Breakdown</h2>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <TrendingUp className="w-3 h-3" />
          <span>Total: {totalDomains} domains</span>
        </div>
      </div>

      <div className="space-y-3">
        {sites.map((site, index) => {
          const percentage = totalDomains > 0 
            ? ((site.domains.length / totalDomains) * 100).toFixed(1)
            : 0;

          const colors = [
            { bg: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/50", text: "text-blue-400" },
            { bg: "from-green-500/20 to-green-600/20", border: "border-green-500/50", text: "text-green-400" },
            { bg: "from-orange-500/20 to-orange-600/20", border: "border-orange-500/50", text: "text-orange-400" },
            { bg: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/50", text: "text-purple-400" },
            { bg: "from-pink-500/20 to-pink-600/20", border: "border-pink-500/50", text: "text-pink-400" },
          ];

          const colorScheme = colors[index % colors.length];

          return (
            <div
              key={site.site_id}
              className={`bg-gradient-to-r ${colorScheme.bg} border ${colorScheme.border} rounded-lg p-3 hover:scale-[1.01] transition-transform duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${colorScheme.bg}`}>
                    <Globe className={`w-3.5 h-3.5 ${colorScheme.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white truncate">{site.site_name}</h3>
                    <p className="text-xs text-gray-400">Site ID: {site.site_id}</p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="text-lg font-bold text-white">{site.domains.length}</p>
                  <p className="text-xs text-gray-400">domains</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorScheme.bg.replace('/20', '')} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className={`text-xs ${colorScheme.text} mt-1.5 text-right`}>
                {percentage}% of total domains
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
