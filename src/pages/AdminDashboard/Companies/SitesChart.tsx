// src/pages/AdminDashboard/Companies/SitesChart.tsx
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

type Site = {
  site_id: number;
  site_name: string;
  domains: any[];
};

type Props = {
  sites: Site[];
};

const COLORS = [
  "#6A81FF",
  "#18BF35",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899"
];

export default function SitesChart({ sites }: Props) {
  const chartData = useMemo(() => {
    return sites.map((site) => ({
      name: site.site_name,
      domains: site.domains.length,
      site_id: site.site_id
    }));
  }, [sites]);

  return (
    <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Domains per Site</h2>
        <span className="text-gray-400 text-xs">Distribution Overview</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={40}>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.25} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              contentStyle={{
                backgroundColor: "#0a1b30",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "white",
                fontSize: 12,
              }}
              labelStyle={{ color: "white", fontSize: 12 }}
              formatter={(value) => [value, "Domains"]}
            />
            <Bar
              dataKey="domains"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#barGradient${index % COLORS.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
