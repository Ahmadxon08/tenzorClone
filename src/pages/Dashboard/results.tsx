import {
  AlertCircle,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  RefreshCw,
  Search,
  User,
  X,
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  MessageCircle,
  Filter,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import "react-tabs/style/react-tabs.css";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import ChatModal from "./Applications/ChatModal";

interface TestResult {
  id: number;
  name: string;
  phonenumber: string;
  score: number;
  site_id: number | null;
  vakansiya_id: number | null;
  resume: string | null;
  session_id: string;
  created_at: string;
  is_new: boolean | null;

  vakansiya: string | null;
  vakansiya_title: string | null;
  phone_number?: string; // Optional for fallback
  phone?: string; // Optional for fallback
  candidate_name?: string; // Optional for fallback
  video_url?: string | null; // Optional video URL
}

const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<number>(0);
  const [sortField, setSortField] = useState<"score" | "created_at" | "name">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("test");
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<TestResult | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const paramSearch = searchParams.get("search");
  useEffect(() => {
    if (paramSearch) {
      setSearchQuery(paramSearch);
    }
  }, [paramSearch]);

  useEffect(()=>{
    console.log(selectedResult)
  }, [selectedResult])

  const fetchResults = async () => {
    setLoading(true);

    try {
      let url = `https://ai.tenzorsoft.uz/vakand/list?type=test`;

      if (typeFilter === "video") {
        url = `https://ai.tenzorsoft.uz/video_app/list?type=Video&status=completed`;
      }

      const response = await fetch(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Handle different response structures:
      // 1. { data: [...] } - standard
      // 2. [...] - array directly
      // 3. { items: [...] } - common alternative
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else if (Array.isArray(data.items)) {
        list = data.items;
      }

      setResults(list);
      setFilteredResults(list);
      console.log("Processed list:", list);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [scoreFilter, token, typeFilter]);

  useEffect(() => {
    let filtered = [...results];
    if (scoreFilter > 0) {
      filtered = filtered.filter((result) => result.score >= scoreFilter);
    }
    if (fromDate) {
      const start = new Date(fromDate).getTime();
      filtered = filtered.filter(
        (result) => new Date(result.created_at).getTime() >= start
      );
    }
    if (toDate) {
      const end = new Date(toDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (result) => new Date(result.created_at).getTime() <= end
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const phone = (p: string) => p.replace(/\s+/g, "");
      filtered = filtered.filter((result) => {
        return (
          result.name.toLowerCase().includes(query) ||
          phone(result.phonenumber).includes(query) ||
          (result.vakansiya_title &&
            result.vakansiya_title.toLowerCase().includes(query))
        );
      });
    }
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "score") comparison = a.score - b.score;
      else if (sortField === "created_at")
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortField === "name") comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredResults(filtered);
  }, [
    searchQuery,
    results,
    scoreFilter,
    sortField,
    sortOrder,
    fromDate,
    toDate,
  ]);

  const handleSort = (field: "score" | "created_at" | "name") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleRefresh = () => {
    fetchResults();
    // toast.info(t("resultsPage.refreshed") || "Ma'lumotlar yangilandi");
  };

  const openModal = (result: TestResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const openChat = (app: TestResult) => {
    setSelectedApplication(app);
    setIsChatOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-green-400 bg-green-500/10 border-green-500/20";
    if (score >= 60) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (score >= 40)
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  if (loading && results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400">
            {t("common.loading") || "Yuklanmoqda..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("resultsPage.header.title") || "Test Natijalari"}
          </h1>
          <p className="text-gray-400 mt-1">
            {t("resultsPage.header.subtitle") ||
              "Barcha test topshiruvchilar natijalari"}
          </p>
        </div>

        <div className="flex flex-wrap  gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a1b30]/50 hover:bg-[#0a1b30]/70 border border-white/10 rounded-xl text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {t("common.refresh") || "Yangilash"}
          </button>
        </div>
      </div>

      {/* === STATISTICS CARDS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
        {/* Total Results */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("resultsPage.stats.total") || "Всего результатов"}
              </p>
              <p className="text-2xl font-bold text-white">{results.length}</p>
            </div>
          </div>
        </div>

        {/* High Results (80+) */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("resultsPage.stats.high") || "Высокие результаты (80+)"}
              </p>
              <p className="text-2xl font-bold text-white">
                {results.filter((r) => r.score >= 80).length}
              </p>
            </div>
          </div>
        </div>

        {/* Low Results (≤ 40) */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-all group">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 group-hover:scale-110 transition-transform">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("resultsPage.stats.low") || "Низкие результаты (≤ 40)"}
              </p>
              <p className="text-2xl font-bold text-white">
                {results.filter((r) => r.score <= 40).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mt-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            {/* Search and Filter Toggle Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[300px]">
                <label className="text-sm text-gray-400 mb-2 block">
                  {t("resultsPage.filters.search") || "Qidirish"}
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      t("resultsPage.filters.searchPlaceholder") ||
                      "Ism, telefon... qidirish"
                    }
                    className="w-full bg-[#0a1b30]/50 text-white pl-10 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`mt-7 p-2.5 px-4 rounded-xl border transition-all flex items-center gap-2 ${showFilters
                  ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "bg-[#0a1b30]/50 text-gray-400 border-white/10 hover:bg-white/5"
                  }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">{t("resultsPage.filters.toggle") || "Filters"}</span>
              </button>
            </div>

            {/* Collapsible Filters */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0"
                }`}
            >
              <div className="flex flex-wrap items-end gap-4 p-4 rounded-2xl bg-[#0a1b30]/40 border border-white/5">
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">
                    {t("resultsPage.filters.type") || "Turi"}
                  </label>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v)}
                  >
                    <SelectTrigger className="w-40 bg-[#0a1b30] border border-white/10 text-white h-10 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1b30] text-white border border-white/10">
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">
                    {t("resultsPage.filters.minScore") || "Minimal ball"}
                  </label>
                  <Select
                    value={String(scoreFilter)}
                    onValueChange={(v) => setScoreFilter(Number(v))}
                  >
                    <SelectTrigger className="w-40 bg-[#0a1b30] border border-white/10 text-white h-10 rounded-xl">
                      <SelectValue
                        placeholder={
                          t("resultsPage.filters.allScores") || "Barcha ballar"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1b30] text-white border border-white/10">
                      <SelectItem value="0">
                        {t("resultsPage.filters.allScores") || "Barcha ballar"}
                      </SelectItem>
                      <SelectItem value="40">40+</SelectItem>
                      <SelectItem value="60">60+</SelectItem>
                      <SelectItem value="80">80+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">
                    {t("resultsPage.filters.fromDate") || "Dan (Sana)"}
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-52 bg-[#0a1b30] text-white pl-10 pr-3 h-10 rounded-xl border border-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">
                    {t("resultsPage.filters.toDate") || "Gacha (Sana)"}
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-52 bg-[#0a1b30] text-white pl-10 pr-3 h-10 rounded-xl border border-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0a1b30]/30">
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                      >
                        {t("resultsPage.table.name") || "Ism"}
                        {sortField === "name" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-sm font-semibold text-gray-400">
                        {t("resultsPage.table.phone") || "Telefon"}
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("score")}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                      >
                        {t("resultsPage.table.score") || "Ball"}
                        {sortField === "score" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-sm font-semibold text-gray-400">
                        {t("resultsPage.table.vacancy") || "Vakansiya"}
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                      >
                        {t("resultsPage.table.date") || "Sana"}
                        {sortField === "created_at" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </button>
                    </th>
                    {/* <th className="px-6 py-4 text-left">

                          <span className="text-sm font-semibold text-gray-400">
                            {t("resultsPage.table.status") || "Status"}
                          </span>
                        </th> */}
                    <th className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-400">
                        {t("resultsPage.table.actions") || "Amallar"}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">
                          {t("resultsPage.table.noResults") ||
                            "Natijalar topilmadi"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result) => {
                      if (!result.name) {
                        console.warn("Missing name for result:", result);
                      };
                      return (
                        <tr
                          key={result.id}
                          className="border-b border-white/5 hover:bg-[#0a1b30]/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <User size={18} className="text-blue-400" />
                              </div>
                              <span className="text-white font-medium whitespace-nowrap">
                                {result.name || result.candidate_name || "Noma'lum"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 font-mono text-sm">
                              {result.phonenumber || result.phone || '---'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getScoreColor(
                                result.score || 0
                              )}`}
                            >
                              <Award size={14} />
                              <span className="font-bold">{result.score || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {result.vakansiya_title ? (
                              <span className="text-gray-300 text-sm">
                                {result.vakansiya_title || 'N/A' }
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm italic">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-400 text-sm">
                              {result.created_at ? formatDate(result.created_at) : "---"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4">
                              <button
                                onClick={() => openModal(result)}
                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                                title={
                                  t("resultsPage.table.viewDetails") ||
                                  "Batafsil ko'rish"
                                }
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openChat(result)}
                                className="
              px-3 py-1 rounded-sm text-sm text-yellow-400 border border-yellow-500/20 
              bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/20 
              transition-all
            "
                                title={t("applicationsPage.table.chat") || "Chat"}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {
        isModalOpen && selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-[#0a1b30] to-[#071226] rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0a1b30]/95 backdrop-blur-xl px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Eye size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t("resultsPage.modal.title") || "Batafsil ma'lumot"}
                    </h2>
                    <p className="text-xs text-gray-400">
                      ID: {selectedResult.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {t("resultsPage.modal.personalInfo") || "Shaxsiy ma'lumotlar"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1 p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <User size={16} />
                        <span className="text-xs">
                          {t("resultsPage.modal.name") || "Ism"}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        {selectedResult.name}
                      </p>
                    </div>
                    {/* resultsPage.stats.total */}
                    <div className="col-span-2 md:col-span-1 p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Phone size={16} />
                        <span className="text-xs">
                          {t("resultsPage.modal.phone") || "Telefon"}
                        </span>
                      </div>
                      <p className="text-white font-medium font-mono">
                        +998 {selectedResult?.phonenumber?.replace(/^(\+998)/, '') || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {t("resultsPage.modal.testResults") || "Test natijalari"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1 p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Award size={16} />
                        <span className="text-xs">
                          {t("resultsPage.modal.score") || "Ball"}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getScoreColor(
                          selectedResult.score
                        )}`}
                      >
                        <span className="text-2xl font-bold">
                          {selectedResult.score}
                        </span>
                        <span className="text-sm">/ 100</span>
                      </div>
                    </div>

                    <div className="col-span-2 md:col-span-1 p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Briefcase size={16} />
                        <span className="text-xs">
                          {selectedResult.vakansiya_title || 'Topiladi'}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        {(
                          <span className="text-gray-500 italic">
                            {t("resultsPage.modal.noVacancy") || "Ko'rsatilmagan"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {t("resultsPage.modal.technicalInfo") || "Texnik ma'lumotlar"}
                  </h3>

                  <div className="space-y-3">
                    <div className="p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Calendar size={16} />
                        <span className="text-xs">
                          {t("resultsPage.modal.date") ||
                            "Test topshirilgan sana"}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        {formatDate(selectedResult.created_at)}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <FileText size={16} />
                        <span className="text-xs">
                          {t("resultsPage.modal.sessionId") || "Session ID"}
                        </span>
                      </div>
                      <p className="text-white font-mono text-sm break-all">
                        {selectedResult.session_id}
                      </p>
                    </div>

                    {selectedResult.resume && (
                      <div className="p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <FileText size={16} />
                          <span className="text-xs">
                            {t("resultsPage.modal.resume") || "Rezyume"}
                          </span>
                        </div>
                        <p className="text-white">{selectedResult.resume}</p>
                      </div>
                    )}

                    <div className="p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        {selectedResult.is_new ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        <span className="text-xs">
                          {t("resultsPage.modal.status") || "Status"}
                        </span>
                      </div>
                      <p
                        className={`font-medium ${selectedResult.is_new
                          ? "text-green-400"
                          : "text-gray-500"
                          }`}
                      >
                        {selectedResult.is_new
                          ? t("resultsPage.modal.active") || "Faol"
                          : t("resultsPage.modal.inactive") || "Faol emas"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-[#0a1b30]/95 backdrop-blur-xl px-6 py-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all"
                >
                  {t("common.close") || "Yopish"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        isChatOpen && selectedApplication && (
          <ChatModal
            open={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            sessionId={selectedApplication.session_id}
            applicantName={selectedApplication.name}
            videoUrl={selectedApplication.video_url}
          />
        )
      }
    </div >
  );
};
// formatDate
export default ResultsPage;
