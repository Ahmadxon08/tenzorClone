import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TripleAreaChartProps {

  data: any[];
  xKey: string;

  totalKey: string;
  successKey: string;
  failedKey: string;

  totalLabel: string;
  successLabel: string;
  failedLabel: string;

  formatX?: (value: any) => string;
}

export default function TripleAreaChart({

  data,
  xKey,
  totalKey,
  successKey,
  failedKey,
  totalLabel,
  successLabel,
  failedLabel,
  formatX,
}: TripleAreaChartProps) {
  console.log('Results running...')
  return (
    <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      <div className="h-80 w-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6A81FF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6A81FF" stopOpacity={0.05} />
              </linearGradient>

              <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18BF35" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#18BF35" stopOpacity={0.05} />
              </linearGradient>

              <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />

            <XAxis
              dataKey={xKey}
              tickFormatter={formatX}
              stroke="#9CA3AF"
            />
            <YAxis stroke="#9CA3AF" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0a1b30",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "white",
              }}
            />

            <Legend />

            <Area
              type="monotone"
              dataKey={totalKey}
              name={totalLabel}
              stroke="#6A81FF"
              fill="url(#gTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey={successKey}
              name={successLabel}
              stroke="#18BF35"
              fill="url(#gSuccess)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey={failedKey}
              name={failedLabel}
              stroke="#EF4444"
              fill="url(#gFailed)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
