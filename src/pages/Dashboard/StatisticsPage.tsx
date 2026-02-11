// src/pages/dashboard/StatisticsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { DatePicker, Button } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Globe2, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import {
  StackedBarChart,
  type BarChartData,
} from "../../components/ui/barchart";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";

type Granularity = "day" | "week" | "month" | "year";

interface VacStat {
  date: string; // e.g. "2025-10-07" yoki server qaytargan format
  total: number;
  success: number;
  failed: number;
}

interface DomainStat {
  domain_id: number;
  domain: string;
  total_requests: number;
}

// const PERIOD_ALL = 100000;

export default function StatisticsPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [granularity, setGranularity] = useState<Granularity>("day");
  const [periodCount, setPeriodCount] = useState<number>(10);

  const [vacStats, setVacStats] = useState<VacStat[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStat[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDomains, setLoadingDomains] = useState(true);
  // const [error, setError] = useState("");
  // const [errorDomains, setErrorDomains] = useState("");

  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(10, "day"),
    dayjs(),
  ]);
  const [activeTab, setActiveTab] = useState("week");

  const tabs = [
    { value: "week", title: t("stats.granularityOptions.week") },
    { value: "month", title: t("stats.granularityOptions.month") },
    { value: "sixMonths", title: t("stats.granularityOptions.sixMonths") },
    { value: "year", title: t("stats.granularityOptions.year") },
  ];
  //bar chart data
  const exampleData: BarChartData[] = [
    { category: "Frontend", correct: 53, incorrect: 25, unanswered: 23 },
    { category: "Backend", correct: 40, incorrect: 38, unanswered: 22 },
    { category: "AI/ML", correct: 26, incorrect: 39, unanswered: 35 },
    { category: "Data analytics", correct: 48, incorrect: 37, unanswered: 15 },
    { category: "Flutter", correct: 38, incorrect: 39, unanswered: 23 },
    { category: "Cybersecurity", correct: 53, incorrect: 24, unanswered: 23 },
    { category: "Full Stack", correct: 40, incorrect: 38, unanswered: 22 },
    { category: ".NET Developer", correct: 26, incorrect: 39, unanswered: 35 },
    {
      category: "Web Designer / UI ",
      correct: 48,
      incorrect: 39,
      unanswered: 13,
    },
    { category: "Kotlin", correct: 38, incorrect: 39, unanswered: 23 },
  ];

  const handleClick = (value: string) => {
    setActiveTab(value);

    switch (value) {
      case "week":
        setGranularity("day");
        setPeriodCount(7);
        setRange([dayjs().subtract(7, "day"), dayjs()]);
        break;
      case "month":
        setGranularity("day");
        setPeriodCount(30);
        setRange([dayjs().subtract(1, "month"), dayjs()]);
        break;
      case "sixMonths":
        setGranularity("week");
        setPeriodCount(26);
        setRange([dayjs().subtract(6, "month"), dayjs()]);
        break;
      case "year":
        setGranularity("month");
        setPeriodCount(12);
        setRange([dayjs().startOf("year"), dayjs()]);
        break;
      default:
        return;
    }
  };

  const fetchAll = async () => {
    if (!token) return;

    // setError("");
    // setErrorDomains("");
    setLoading(true);
    setLoadingDomains(true);

    try {
      const [vac, domains] = await Promise.all([
        apiService.getVacancyCounts(
          token,
          granularity,
          Math.max(10, periodCount)
        ),
        apiService.getDomainStats(token),
      ]);

      setVacStats(Array.isArray(vac) ? vac : []);
      setDomainStats(Array.isArray(domains) ? domains : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
      setLoadingDomains(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, granularity, periodCount]);

  const formatTick = (value: string) => {
    try {
      if (granularity === "day") {
        const [y, m, d] = value.split("-");
        if (y && m && d) return `${m}/${d}`;
      }
      if (granularity === "week") {
        const [year, wk] = value.split("-W");
        if (year && wk) {
          return dayjs()
            .year(Number(year))
            .week(Number(wk))
            .startOf("week")
            .format("DD/MM");
        }
        return value.replace("W", "Wk");
      }
      if (granularity === "month") return value.replace("-", "/");
      return value;
    } catch {
      return value;
    }
  };

  const totalApplicationsSum = useMemo(
    () => vacStats.reduce((acc, r) => acc + (r?.total || 0), 0),
    [vacStats]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("statisticsPage.header.title")}
        </h1>
        <p className="text-gray-400">{t("statisticsPage.header.subtitle")}</p>
      </div>

      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 ">
        <div className="flex flex-wrap items-end gap-3 w-full">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("stats.granularity")}
            </label>
            <DatePicker.RangePicker
              format="DD.MM.YYYY"
              value={range}
              onChange={(value) => {
                setRange(value as [dayjs.Dayjs, dayjs.Dayjs]);
                setActiveTab("custom");
              }}
              size="large"
              className="w-full"
              allowClear={false}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                height: "44px",
                color: "white",
              }}
              // @ts-ignore
              styles={{ popup: { zIndex: 1000 } }}
              classNames={{
                popup: {
                  root: "antd-dark-datepicker-dropdown",
                },
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3 justify-around  items-center">
            {tabs.map((item) => (
              <Button
                key={item.value}
                onClick={() => handleClick(item.value)}
                type="default"
                style={{
                  background:
                    activeTab === item.value
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  height: "44px",
                  color: "white",
                  padding: "0 16px",
                  minWidth: "100px",
                }}
                className="flex items-center justify-center gap-2 hover:bg-white/10 transition-colors duration-300"
              >
                {item.title}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto mt-3 md:mt-0">
            <button
              onClick={(e) => {
                fetchAll();
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              className="flex items-center justify-center h-11 px-4 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-95 focus:outline-none"
              aria-label={t("statsCards.refreshAria")}
            >
              <TrendingUp className="w-5 h-5" />
              {t("stats.refresh")}
            </button>

            <div className="text-sm text-gray-400">
              {t("stats.total")}:{" "}
              <span className="text-white font-medium">
                {totalApplicationsSum}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm p-4">
          <p className="text-white">{error}</p>
        </div>
      )} */}

      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {t("stats.barTitle")}
          </h2>
          <span className="text-gray-400 text-sm">
            {t("stats.barSubtitle")}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vacStats} barSize={80}>
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6A81FF" stopOpacity={0.95} />
                    <stop
                      offset="100%"
                      stopColor="#6A81FF"
                      stopOpacity={0.25}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.06)" }}
                  contentStyle={{
                    backgroundColor: "#0a1b30",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                  }}
                  labelFormatter={(l) => `${t("stats.period")}: ${l}`}
                  formatter={(value) => [value, t("stats.total") as string]}
                />
                <Bar
                  dataKey="total"
                  name={t("stats.total") as string}
                  fill="url(#barG)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {t("stats.areaTitle")}
          </h2>
          <span className="text-gray-400 text-sm">
            {t("stats.areaSubtitle")}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vacStats}>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
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
                  labelFormatter={(l) => `${t("stats.period")}: ${l}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name={t("stats.total") as string}
                  stroke="#6A81FF"
                  fill="url(#gTotal)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  name={t("stats.success") as string}
                  stroke="#18BF35"
                  fill="url(#gSuccess)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  name={t("stats.failed") as string}
                  stroke="#EF4444"
                  fill="url(#gFailed)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="container py-6 mx-auto">
        <StackedBarChart
          data={exampleData}
          title="TEST natijalari"
          description="Barcha test topshiruvchilar natijalari"
        />
      </div>

      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {t("stats.domainTitle")}
          </h2>
          <span className="text-gray-400 text-sm">
            {t("stats.domainSubtitle")}
          </span>
        </div>

        {/* {errorDomains && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-white">{errorDomains}</p>
          </div>
        )} */}

        {loadingDomains ? (
          <div className="p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        ) : domainStats.length === 0 ? (
          <p className="text-gray-400">{t("stats.domainEmpty")}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {domainStats
              .slice()
              .sort((a, b) => b.total_requests - a.total_requests)
              .map((d) => {
                const max =
                  Math.max(...domainStats.map((x) => x.total_requests)) || 1;
                const pct = Math.round((d.total_requests / max) * 100);

                return (
                  <div
                    key={d.domain_id}
                    className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 transition group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Globe2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-white font-medium truncate max-w-[260px]">
                          {d.domain}
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm tabular-nums">
                        {d.total_requests}
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, #6A81FF 0%, #8B5CF6 100%)",
                          boxShadow: "0 0 16px rgba(138,92,246,0.35)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
