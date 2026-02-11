// pages/Dashboard/ApplicationsPage.tsx
import {
  Award,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Filter as FilterIcon,
  ChevronDown,
  Download,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import type { Site } from "../../../types";
import { useMutation } from "@tanstack/react-query";
import { Input } from "../../../components/ui/input";
// import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";
import { format, parseISO } from "date-fns";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Space, Table, Tooltip } from "antd";
import { MessageCircle } from "lucide-react";
import { PhoneOutlined } from "@ant-design/icons";
import ChatModal from "./ChatModal";
import CallToInterview from "./CallToInterview";
import VideoChatModal from "./VideoChatModal";
import { useSearchParams } from "react-router-dom";

interface Application {
  id: number;
  name: string;
  is_new: boolean;
  phonenumber: string;
  resume: string;
  score: number;
  site_name: string;
  vakansiya_title: string | null;
  viewed?: boolean;
  created_at: string;
  invited_time: string;
  session_id: string;
  type: string;
  description?: string;
  video_url?: string;
}

const PASS_THRESHOLD = 60;

type ScoreFilter = "all" | "80plus" | "60to79" | "55to59";
type ResultFilter = "all" | "passed" | "failed";

const ApplicationsPage: React.FC = () => {
  const { t } = useTranslation("");
  const { token, user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [videoLists, setVideoLists] = useState<Application[]>([]);
  const [acceptedApplications, setAcceptedApplications] = useState<
    Application[]
  >([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("applicationsActiveTab") || "all";
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const vacancyIdParam = searchParams.get("id");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [selectedApplicationVideo, setSelectedApplicationVideo] =
    useState<Application | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedApplicationForCall, setSelectedApplicationForCall] =
    useState<Application | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(
    user?.sites?.[0] ?? ({} as Site)
  );

  const [unseenCountsBySite, setUnseenCountsBySite] = useState<
    Record<string, number>
  >({});

  const downloadBaseUrl = "https://ai.tenzorsoft.uz/download/";

  const buildUrlWithAuth = (
    base: string,
    query: Record<string, string | number | undefined> = {},
    authQuery: { public_key?: string | null; username?: string | null } = {}
  ) => {
    const url = new URL(base, window.location.origin);
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    if (authQuery.public_key)
      url.searchParams.set("public_key", authQuery.public_key);
    if (authQuery.username)
      url.searchParams.set("username", authQuery.username);
    return url.toString();
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const trimmed = isoString.replace(/\.(\d{3})\d+/, ".$1");
    const date = parseISO(trimmed);
    return format(date, "dd MMM yyyy HH:mm:ss");
  };

  // Faylni yuklab olish
  const downloadResume = async (filename: string) => {
    if (!filename) return;
    try {
      setDownloadingFile(filename);

      const url = buildUrlWithAuth(
        `${downloadBaseUrl}${encodeURIComponent(filename)}`,
        {},
        {
          public_key: selectedSite?.public_key ?? null,
          username: selectedSite?.site_domain ?? null,
        }
      );

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(
          t("applicationsPage.errors.errorDownload") || "Download failed"
        );
      }

      const blob = await res.blob();
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(href);
    } catch (e) {
      console.error(e);
      alert(t("applicationsPage.errors.errorDownload") || "Download failed");
    } finally {
      setDownloadingFile(null);
    }
  };

  // user o‘zgarsa apiService ga saytni o‘rnatish
  // useEffect(() => {
  //   if (user?.sites && user.sites.length > 0 && !selectedSite) {
  //     setSelectedSite(user.sites[0]);
  //     if (apiService.setSite) {
  //       apiService.setSite(user.sites[0].public_key, user.sites[0].site_domain);
  //     }
  //   }
  // }, [user]);

  // useEffect(() => {
  //   if (token) {
  //     loadApplications();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [token, selectedSite]);

  // const loadApplications = async () => {
  //   if (!token) return;

  //   setLoading(true);
  //   try {
  //     const data = await apiService.getApplications(
  //       token,
  //       selectedSite?.public_key,
  //       selectedSite?.site_domain
  //     );
  //     setApplications(data);
  //   } catch (error) {
  //     console.error("Failed to load applications:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  useEffect(() => {
    localStorage.setItem("applicationsActiveTab", activeTab);
  }, [activeTab]);
  const fetchVideoLists = async () => {
      if (!token || !selectedSite) return;

    try {
      setLoading(true);
      // offset hisoblash
      const offset = (currentPage - 1) * limit;
      const url = new URL("https://ai.tenzorsoft.uz/video/list");

      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("search", searchTerm);
      if (selectedSite?.public_key)
        url.searchParams.set("public_key", selectedSite.public_key);
      if (selectedSite?.site_domain)
        url.searchParams.set("username", selectedSite.site_domain);
      const res = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      const videoes = (data.data || [])
        .map((item: any) => ({
          id: item.id,
          name: item.candidate_name,
          phonenumber: item.phone,
          resume: item.resume_file,
          score: item.score,
          is_new: item.is_new,
          vakansiya_title: item.vakansiya_title,
          site_name: item.site_name,
          created_at: item.created_at,
          session_id: item.session_id,
          video_url: item.video_url,
          viewed: false,
          description: item.description || "",
        }))

      setVideoLists(videoes);
      setTotalItems(data.total || 0); // Update total items count after filtering
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }
  const fetchApplications = async () => {
    if (!token || !selectedSite) return;

    try {
      setLoading(true);
      // offset hisoblash
      const offset = (currentPage - 1) * limit;
      const url = new URL("https://ai.tenzorsoft.uz/vakand/list?type=widget");

      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("search", searchTerm);

      if (vacancyIdParam) {
        url.searchParams.set("vakansiya_id", vacancyIdParam);
      }
      if (selectedSite?.public_key)
        url.searchParams.set("public_key", selectedSite.public_key);
      if (selectedSite?.site_domain)
        url.searchParams.set("username", selectedSite.site_domain);

      const res = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      const apps = (data.data || [])
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          phonenumber: item.phonenumber,
          resume: item.resume,
          score: item.score,
          is_new: item.is_new,
          vakansiya_title: item.vakansiya_title,
          site_name: item.site_name,
          created_at: item.created_at,
          invited_time: item.invited_time,
          session_id: item.session_id,
          type: item.type,
          viewed: false,
          description: item.description || "",
        }))

      setApplications(apps);
      setTotalItems(data.total || 0); // Update total items count after filtering
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnseenCountsBySite = async (): Promise<Record<string, number>> => {
    if (!user?.sites || !token) return {};

    const counts: Record<string, number> = {};

    for (const site of user.sites) {
      try {
        const response = await apiService.getApplicationsCountBySite(
          token,
          site.public_key ?? null,
          site.site_domain ?? null
        );

        if (response?.data && response.data.length > 0) {
          const siteData = response.data[0];
          counts[site.site_name ?? site.name ?? "unknown"] =
            siteData.new_count ?? 0;
        } else {
          counts[site.site_name ?? site.name ?? "unknown"] = 0;
        }
      } catch (err) {
        console.error(
          `Error fetching unseen count for site ${site.name}:`,
          err
        );
        counts[site.site_name ?? site.name ?? "unknown"] = 0;
      }
    }

    return counts;
  };

  const downloadExcel = async () => {
    if (!token || !selectedSite) return;

    setLoading(true);
    try {
      // Build params based on current state
      const params: Record<string, string | number | null> = {
        public_key: selectedSite.public_key ?? null,
        site_domain: String(selectedSite.site_domain),
        vakansiya_id: vacancyIdParam ?? null,
        type: "widget",
        search: searchTerm || null,
        from_date: fromDate || null,
        to_date: toDate || null,
        has_invited: activeTab === "accepted" ? "true" : null,
        success_rate:
          scoreFilter === "all"
            ? null
            : scoreFilter === "80plus"
              ? 80
              : scoreFilter === "60to79"
                ? 60
                : scoreFilter === "55to59"
                  ? 55
                    : null,
        result:
          resultFilter === "all"
            ? null
            : resultFilter === "passed"
              ? "passed"
              : resultFilter === "failed"
                ? "failed"
                : null,
      };

      const data = await apiService.getApplicationsExcel(
        token,
        String(params.public_key),
        String(params.site_domain),
        String(params.vakansiya_id),
        params.success_rate as number | null,
        params.result as string | null,
        String(params.search),
        String(params.from_date),
        String(params.to_date),
        String(params.has_invited)
      );

      // Convert to blob and download
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `applications_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading Excel:", err);
      alert(t("applicationsPage.errors.errorDownload") || "Download failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedApplications = async () => {
    try {
      setLoading(true);

      const offset = (currentPage - 1) * limit;
      const url = new URL("https://ai.tenzorsoft.uz/vakand/list");

      url.searchParams.set("type", "widget");
      url.searchParams.set("has_invited", "true");
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("search", searchTerm);

      // Add the vacancy filter if it exists in the URL
      if (vacancyIdParam) {
        url.searchParams.set("vakansiya_id", vacancyIdParam);
      }

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch accepted applications");

      const data = await res.json();

      const sortedApplications = (data?.data || []).sort(
        (a: { invited_time: string }, b: { invited_time: string }) =>
          new Date(a.invited_time).getTime() -
          new Date(b.invited_time).getTime()
      );

      setAcceptedApplications(sortedApplications);
      setTotalAccepted(data?.total || 0);
    } catch (err) {
      console.error("Error fetching accepted applications:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadUnseenCounts = async () => {
      const unseenCounts = await fetchUnseenCountsBySite();
      setUnseenCountsBySite(unseenCounts);
    };

    loadUnseenCounts();
  }, [user, token]);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, limit, selectedSite, searchTerm]);

  useEffect(() => {
    fetchVideoLists();
  }, [currentPage, limit, selectedSite, searchTerm]);

  useEffect(() => {
    fetchAcceptedApplications();
  }, [currentPage, limit]);

  useEffect(() => {
    if (vacancyIdParam) {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [vacancyIdParam]);

  // useEffect(() => {
  //   if (!token || !selectedSite) return;
  //   apiService
  //     .getApplications(token, selectedSite.public_key, selectedSite.site_domain)
  //     .then((data) => setApplications(data))
  //     .catch(console.error);
  // }, [token, selectedSite]);

  // const unseenCountsBySite = applications.reduce((acc, app) => {
  //   const siteKey = app.site_name ?? "unknown";
  //   acc[siteKey] = (acc[siteKey] || 0) + (app.is_new ? 1 : 0);
  //   return acc;
  // }, {} as Record<string, number>);

    const filteredVideoLists = useMemo(() => {
      const filtered = videoLists.filter((video) => {
        video.score = video.score || 0;
        let matchesScore = true;
        if (scoreFilter === "80plus") matchesScore = video.score >= 80;
        else if (scoreFilter === "60to79") 
          matchesScore = video.score >= 60 && video.score < 80;
        else if (scoreFilter === "55to59")
          matchesScore = video.score >= 55 && video.score < 60;
        
        if (!matchesScore) return false;
  
        let matchesResult = true;
        if (resultFilter === "passed")
          matchesResult = video.score >= PASS_THRESHOLD;
        else if (resultFilter === "failed")
          matchesResult = video.score < PASS_THRESHOLD;
  
        return matchesResult;
      })
      return filtered.sort((a, b) => {
        if (a.is_new && !b.is_new) return -1;
        if (!a.is_new && b.is_new) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }, [videoLists, scoreFilter, resultFilter, fromDate, toDate]);

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app) => {
      // Skip applications with score < 55
      if (app.score < 55) return false;
      
      let matchesScore = true;
      if (scoreFilter === "80plus") matchesScore = app.score >= 80;
      else if (scoreFilter === "60to79") 
        matchesScore = app.score >= 60 && app.score < 80;
      else if (scoreFilter === "55to59")
        matchesScore = app.score >= 55 && app.score < 60;
      
      if (!matchesScore) return false;

      let matchesResult = true;
      if (resultFilter === "passed")
        matchesResult = app.score >= PASS_THRESHOLD;
      else if (resultFilter === "failed")
        matchesResult = app.score < PASS_THRESHOLD;

      return matchesResult;
    });

    return filtered.sort((a, b) => {
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [applications, scoreFilter, resultFilter]);

  const filterAcceptedApplications = useMemo(() => {
    return acceptedApplications
      .filter((app) => {
        let matchesScore = true;
        if (scoreFilter === "80plus") matchesScore = app.score >= 80;
        else if (scoreFilter === "60to79")
          matchesScore = app.score >= 60 && app.score < 80;
        else if (scoreFilter === "55to59")
          matchesScore = app.score >= 55 && app.score < 60;

        if (!matchesScore) return false;

        let matchesResult = true;
        if (resultFilter === "passed")
          matchesResult = app.score >= PASS_THRESHOLD;
        else if (resultFilter === "failed")
          matchesResult = app.score < PASS_THRESHOLD;

        let matchesDate = true;
        if (fromDate)
          matchesDate = new Date(app.created_at) >= new Date(fromDate);
        if (toDate)
          matchesDate =
            matchesDate && new Date(app.created_at) <= new Date(toDate);

        return matchesResult && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [acceptedApplications, scoreFilter, resultFilter, fromDate, toDate]);

  const filterByDate = async () => {
    if (!token || !selectedSite?.public_key) return;
    if (!fromDate && !toDate) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.filterVakandByDate(
        token,
        selectedSite.public_key,
        fromDate,
        toDate,
        selectedSite?.site_domain ?? null
      );

      setApplications(data);
    } catch (error) {
      console.error("Failed to filter by date:", error);
    } finally {
      setLoading(false);
    }
  };

  // const getScoreBadge = (score: number) => {
  //   if (score >= 80) {
  //     return {
  //       gradient: "from-green-500/30 to-emerald-500/30",
  //       border: "border-green-500/40",
  //       text: "text-green-300",
  //       glow: "shadow-green-500/20",
  //       color: "#10b981"
  //     };
  //   }
  //   if (score >= 60) {
  //     return {
  //       gradient: "from-yellow-500/30 to-orange-500/30",
  //       border: "border-yellow-500/40",
  //       text: "text-yellow-300",
  //       glow: "shadow-yellow-500/20",
  //       color: "#f59e0b"
  //     };
  //   }
  //   return {
  //     gradient: "from-red-500/30 to-rose-500/30",
  //     border: "border-red-500/40",
  //     text: "text-red-300",
  //     glow: "shadow-red-500/20",
  //     color: "#ef4444"
  //   };
  // };

  const highScoreApps = applications.filter((app) => app.score >= 80).length;
  const avgScore =
    applications.length > 0
      ? Math.round(
        applications.reduce((sum, app) => sum + app.score, 0) /
        applications.length
      )
      : 0;
  const markAsViewedMutation = useMutation<any, any, number>({
    mutationFn: async (id: number) => {
      return apiService.markVacandAsShowed(
        id,
        token ?? undefined,
        selectedSite?.public_key,
        selectedSite?.site_domain
      );
    },
    
    onMutate: async (id: number) => {
      const previous = applications;
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, viewed: true } : a))
      );
      return { previous };
    },
    onError: (err: any, _id: number, context: any) => {
      console.error("Failed to mark as viewed:", err);
      if (context?.previous) setApplications(context.previous);
      alert("Xato: CV ni belgilash muvaffaqiyatsiz.");
    },
    onSuccess: () => {
      // loadApplications();
    },
  });
 const markAsViewedVideoMutation = useMutation<any, any, number>({
    mutationFn: async (id: number) => {
      return apiService.markVacandVideoAsShowed(
        id,
        token ?? undefined,
        selectedSite?.public_key,
        selectedSite?.site_domain
      );
    },
    
    onMutate: async (id: number) => {
      const previous = videoLists;
      setVideoLists((prev) =>
        prev.map((a) => (a.id === id ? { ...a, viewed: true } : a))
      );
      return { previous };
    },
    onError: (err: any, _id: number, context: any) => {
      console.error("Failed to mark as viewed:", err);
      if (context?.previous) setVideoLists(context.previous);
      alert("Xato: Video ni belgilash muvaffaqiyatsiz.");
    },
    onSuccess: () => {
      // loadApplications();
    },
  });

  const openChat = (app: Application) => {
    setSelectedApplication(app);
    setIsChatOpen(true);
  };

  const openVideoChat = (app: Application) => {
    setSelectedApplicationVideo(app);
    setIsVideoChatOpen(true);
  };

  const openCallModal = (app: Application) => {
    setSelectedApplicationForCall(app);
    setIsCallModalOpen(true);
  };

  const tableColumns = [
    {
      title: t("applicationsPage.table.name") || "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text: string) => (
        <span className="font-medium wrap text-xs sm:text-sm">{text}</span>
      ),
    },

    {
      title: t("applicationsPage.table.phone") || "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 130,
      align: "center" as const,
      render: (text: string) => (
        <span className="text-center block text-xs sm:text-sm">
          {text || "—"}
        </span>
      ),
    },

    {
      title: t("applicationsPage.table.vacancy") || "Vacancy",
      dataIndex: "vakansiya_title",
      key: "vakansiya_title",
      width: 140,
      align: "center" as const,
      render: (text: string | null) => (
        <span className=" text-gray-300 wrap">{text || "—"}</span>
      ),
    },

    {
      title: t("applicationsPage.table.site") || "Site",
      dataIndex: "site_name",
      key: "site_name",
      width: 120,
      align: "center" as const,
      render: (text: string) => (
        <span className="block text-center wrap">{text}</span>
      ),
    },

    {
      title: t("applicationsPage.table.score") || "Score",
      dataIndex: "score",
      key: "score",
      width: 90,
      align: "center" as const,
      render: (score: number) => {
        const color = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

        return (
          <div
            className={`
            inline-flex items-center justify-center px-2 py-0.5
            text-xs font-bold rounded-md
            status-${color}
          `}
          >
            {score}
          </div>
        );
      },
    },

    {
      title: t("applicationsPage.table.date") || "Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      align: "center" as const,
      render: (date: string) => (
        <span className="text-sm text-gray-400 wrap">{formatDate(date)}</span>
      ),
    },

    {
      title: t("applicationsPage.table.actions") || "Actions",
      key: "actions",
      width: 210,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, app: Application) => (
        <Space size="small" className="flex flex-wrap justify-center">
          <div className="flex gap-x-2">
            {user?.role === "admin" ? null : (
              <Tooltip
                title={
                  app.viewed
                    ? t("applicationsPage.card.viewed")
                    : t("applicationsPage.card.view")
                }
              >
                <button
                  onClick={() => markAsViewedMutation.mutate(app.id)}
                  disabled={!!app.viewed || markAsViewedMutation.isPending}
                  className={`
              cursor-pointer inline-flex items-center gap-2 px-2.5 py-1 text-sm font-semibold rounded-sm border
              ${app.viewed || !app.is_new
                      ? "from-green-500/30 to-emerald-500/30 border-green-500/40 text-green-300 shadow-green-500/20 bg-green-500/10 hover:text-green-300 hover:border-green-500/40 hover:bg-green-500/20 transition-all"
                      : "from-red-500/30 to-rose-500/30 border-red-500/40 text-red-300 shadow-red-500/20 bg-red-500/10 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/20 transition-all"
                    }`}
                >
                  {app.viewed || !app.is_new
                    ? t("applicationsPage.card.viewed")
                    : t("applicationsPage.card.view")}
                </button>
              </Tooltip>
            )}
            <Tooltip
              title={t("applicationsPage.table.download") || "Download Resume"}
            >
              <button
                onClick={() => downloadResume(app.resume)}
                disabled={downloadingFile === app.resume}
                className="
              px-3 py-1 rounded-sm text-sm text-blue-400 border border-blue-500/20 
              bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/20 
              transition-all disabled:opacity-50
            "
              >
                CV
              </button>
            </Tooltip>
            {user?.role === "admin" ? null : (
              <>
                <Tooltip title={t("applicationsPage.table.chat") || "Chat"}>
                  <button
                    onClick={() => openChat(app)}
                    className="
              px-3 py-1 rounded-sm text-sm text-yellow-400 border border-yellow-500/20 
              bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/20 
              transition-all
            "
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip title={t("applicationsPage.table.call") || "Call"}>
                  <button
                    onClick={() => openCallModal(app)}
                    className="
              px-3 py-1 rounded-sm text-sm text-cyan-400 border border-cyan-500/20 
              bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/20 
              transition-all
            "
                  >
                    <PhoneOutlined />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </Space>
      ),
    },
  ];

  const tableColumn2 = [
    {
      title: t("applicationsPage.table.name") || "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text: string) => (
        <span className="font-medium wrap text-xs sm:text-sm">{text}</span>
      ),
    },

    {
      title: t("applicationsPage.table.phone") || "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 130,
      render: (text: string) => <span>{text || "—"}</span>,
    },

    {
      title: t("applicationsPage.table.vacancy") || "Vacancy",
      dataIndex: "vakansiya_title",
      key: "vakansiya_title",
      width: 140,
      // align: "center" as const,
      render: (text: string | null) => (
        <span className=" text-gray-300 wrap">{text || "—"}</span>
      ),
    },

    {
      title: t("applicationsPage.table.site") || "Site",
      dataIndex: "site_name",
      key: "site_name",
      width: 120,
      // align: "center" as const,
      render: (text: string) => <span className="wrap">{text}</span>,
    },

    {
      title: t("applicationsPage.table.date") || "Date",
      dataIndex: "invited_time",
      key: "invited_time",
      width: 150,
      // align: "center" as const,
      render: (date: string) => (
        <span className="text-sm text-gray-400 wrap">{formatDate(date)}</span>
      ),
    },
    {
      title: t("applicationsPage.table.score") || "Score",
      dataIndex: "score",
      key: "score",
      width: 90,
      align: "center" as const,
      render: (score: number) => {
        const color = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

        return (
          <div
            className={`
            inline-flex items-center justify-center px-2 py-0.5
            text-xs font-bold rounded-md
            status-${color}
          `}
          >
            {score}
          </div>
        );
      },
    },

    {
      title: t("applicationsPage.table.actions") || "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, app: Application) => (
        <Space size="small" className="flex flex-wrap justify-center">
          <div className="flex gap-x-2">
            <Tooltip
              title={t("applicationsPage.table.download") || "Download Resume"}
            >
              <button
                onClick={() => downloadResume(app.resume)}
                disabled={downloadingFile === app.resume}
                className="
              px-3 py-1 rounded-sm text-sm text-blue-400 border border-blue-500/20 
              bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/20 
              transition-all disabled:opacity-50
            "
              >
                CV
              </button>
            </Tooltip>

            {user?.role === "admin" ? null : (
              <>
                <Tooltip title={t("applicationsPage.table.chat") || "Chat"}>
                  <button
                    onClick={() => openChat(app)}
                    className="
              px-3 py-1 rounded-sm text-sm text-yellow-400 border border-yellow-500/20 
              bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/20 
              transition-all
            "
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip title={t("applicationsPage.table.call") || "Call"}>
                  <button
                    onClick={() => openCallModal(app)}
                    className="
              px-3 py-1 rounded-sm text-sm text-cyan-400 border border-cyan-500/20 
              bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/20 
              transition-all
            "
                  >
                    <PhoneOutlined />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </Space>
      ),
    },
  ];
  const tableColumns3 = [
    {
      title: t("applicationsPage.table.name") || "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text: string) => (
        <span className="font-medium wrap text-xs sm:text-sm">{text}</span>
      ),
    },

    {
      title: t("applicationsPage.table.phone") || "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 130,
      align: "center" as const,
      render: (text: string) => (
        <span className="text-center block text-xs sm:text-sm">
          {text || "—"}
        </span>
      ),
    },

    {
      title: t("applicationsPage.table.vacancy") || "Vacancy",
      dataIndex: "vakansiya_title",
      key: "vakansiya_title",
      width: 140,
      align: "center" as const,
      render: (text: string | null) => (
        <span className=" text-gray-300 wrap">{text || "—"}</span>
      ),
    },

    {
      title: t("applicationsPage.table.site") || "Site",
      dataIndex: "site_name",
      key: "site_name",
      width: 120,
      align: "center" as const,
      render: (text: string) => (
        <span className="block text-center wrap">{text}</span>
      ),
    },

    {
      title: t("applicationsPage.table.score") || "Score",
      dataIndex: "score",
      key: "score",
      width: 90,
      align: "center" as const,
      render: (score: number) => {
        const color = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

        return (
          <div
            className={`
            inline-flex items-center justify-center px-2 py-0.5
            text-xs font-bold rounded-md
            status-${color}
          `}
          >
            {score}
          </div>
        );
      },
    },

    {
      title: t("applicationsPage.table.date") || "Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      align: "center" as const,
      render: (date: string) => (
        <span className="text-sm text-gray-400 wrap">{formatDate(date)}</span>
      ),
    },

    {
      title: t("applicationsPage.table.actions") || "Actions",
      key: "actions",
      width: 210,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, app: Application) => (
        <Space size="small" className="flex flex-wrap justify-center">
          <div className="flex gap-x-2">
            {user?.role === "admin" ? null : (
              <Tooltip
                title={
                  app.viewed
                    ? t("applicationsPage.card.viewed")
                    : t("applicationsPage.card.view")
                }
              >
                <button
                  onClick={() => markAsViewedVideoMutation.mutate(app.id)}
                  disabled={!!app.viewed || markAsViewedVideoMutation.isPending}
                  className={`
              cursor-pointer inline-flex items-center gap-2 px-2.5 py-1 text-sm font-semibold rounded-sm border
              ${app.viewed || !app.is_new
                      ? "from-green-500/30 to-emerald-500/30 border-green-500/40 text-green-300 shadow-green-500/20 bg-green-500/10 hover:text-green-300 hover:border-green-500/40 hover:bg-green-500/20 transition-all"
                      : "from-red-500/30 to-rose-500/30 border-red-500/40 text-red-300 shadow-red-500/20 bg-red-500/10 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/20 transition-all"
                    }`}
                >
                  {app.viewed || !app.is_new
                    ? t("applicationsPage.card.viewed")
                    : t("applicationsPage.card.view")}
                </button>
              </Tooltip>
            )}
            <Tooltip
              title={t("applicationsPage.table.download") || "Download Resume"}
            >
              <button
                onClick={() => downloadResume(app.resume)}
                disabled={downloadingFile === app.resume}
                className="
              px-3 py-1 rounded-sm text-sm text-blue-400 border border-blue-500/20 
              bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/20 
              transition-all disabled:opacity-50
            "
              >
                CV
              </button>
            </Tooltip>
            {user?.role === "admin" ? null : (
              <>
                <Tooltip title={t("applicationsPage.table.chat") || "Chat"}>
                  <button
                    onClick={() => openVideoChat(app)}
                    className="
                      px-3 py-1 rounded-sm text-sm text-yellow-400 border border-yellow-500/20 
                      bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/20 
                      transition-all
                    "
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip title={t("applicationsPage.table.call") || "Call"}>
                  <button
                    onClick={() => openCallModal(app)}
                    className="
              px-3 py-1 rounded-sm text-sm text-cyan-400 border border-cyan-500/20 
              bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/20 
              transition-all
            "
                  >
                    <PhoneOutlined />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </Space>
      ),
    },
  ];  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {t("applicationsPage.header.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            {t("applicationsPage.header.subtitle")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("applicationsPage.stats.totalApplications.title")}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {activeTab == "all" ? totalItems : totalAccepted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("applicationsPage.stats.highScore.title")}
              </p>
              <p className="text-2xl font-bold text-white">{highScoreApps}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("applicationsPage.stats.avgScore.title")}
              </p>
              <p className="text-2xl font-bold text-white">{avgScore}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        className="mt-6"
       selectedIndex={activeTab === "all" ? 0 : activeTab === "natijalar" ? 1 : 2}
        onSelect={(index) => {
          const newTab = index === 0 ? "all" : index === 1 ? "natijalar" : "accepted";
          setActiveTab(newTab);
        }}
      >
        <TabList className="flex gap-1 sm:gap-2 border-b border-white/10 mb-4 sm:mb-6 overflow-x-auto">
          <Tab
            value="all"
            onClick={() => setActiveTab("all")}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-white hover:text-white hover:cursor-pointer focus:outline-none rounded-sm hover:border-blue-500/50 transition-colors whitespace-nowrap"
            selectedClassName="text-blue-400 bg-blue-500/10 border-blue-500/20 "
          >
            {t("applicationsPage.tabs.applications") || "Applications"}
          </Tab>
          <Tab
            value="natijalar"
            onClick={() => setActiveTab("natijalar")}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-white hover:text-white hover:cursor-pointer focus:outline-none rounded-sm hover:border-blue-500/50 transition-colors whitespace-nowrap"
            selectedClassName="text-blue-400 bg-blue-500/10 border-blue-500/20 "
          >
            {t("applicationsPage.tabs.results") || "Natijalar"}
          </Tab>
          <Tab
            value="accepted"
            onClick={() => setActiveTab("accepted")}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-white hover:text-white hover:cursor-pointer focus:outline-none rounded-sm hover:border-blue-500/50 transition-colors whitespace-nowrap"
            selectedClassName="text-blue-400 bg-blue-500/10 border-blue-500/20"
          >
            {t("applicationsPage.tabs.accepted") || "Detailed View"}
          </Tab>
        </TabList>

        <TabPanel>
          <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl overflow-x-auto">
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 items-stretch md:items-center md:flex-row">
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("applicationsPage.search.placeholder")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 sm:pl-12 w-full md:w-[300px] lg:w-[400px] pr-4 py-2 sm:py-3 max-h-10 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-0 h-10 rounded-xl border border-white/10 bg-[#0a1b30]/60 hover:bg-[#0f2140] text-white text-sm sm:text-base w-full md:w-auto"
                aria-expanded={showFilters}
              >
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("applicationsPage.filters.title") || "Filtrlar"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {user?.role === "admin" ? null : (
                  <div>
                    <Select
                      value={selectedSite ? JSON.stringify(selectedSite) : ""}
                      onValueChange={(val: string) => {
                        try {
                          const site = val ? JSON.parse(val) : null;
                          setSelectedSite(site);
                          if (apiService.setSite) {
                            apiService.setSite(
                              site?.public_key ?? null,
                              site?.site_domain ?? null
                            );
                          }
                        } catch {
                          setSelectedSite(null);
                          if (apiService.setSite)
                            apiService.setSite(null, null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-auto sm:max-w-48 min-h-10 h-10 sm:min-w-34 max-h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue>
                          {selectedSite
                            ? selectedSite.site_name ?? selectedSite.name
                            : t("applicationsPage.siteSelect.placeholder")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1b30] border border-white/10 text-white max-h-60 overflow-y-auto">
                        {user?.sites?.map((site: Site, i: number) => {
                          const siteName =
                            site.site_name ?? site.name ?? "unknown";
                          const count = unseenCountsBySite[siteName] ?? 0;

                          return (
                            <SelectItem
                              key={`${site.id}-${i}`}
                              value={JSON.stringify(site)}
                              className="flex justify-between items-center text-white cursor-pointer"
                            >
                              <span>{siteName}</span>
                              {count > 0 && (
                                <span className="ml-2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                                  {unseenCountsBySite[siteName]}
                                </span>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="flex cursor-pointer items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-3.5 max-h-10 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("applicationsPage.refreshButton")}
                </button>
                <button
                  onClick={downloadExcel}
                  disabled={loading}
                  className="flex cursor-pointer items-center gap-2 px-3 sm:px-5 py-2 sm:py-3.5 max-h-10 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 w-full sm:w-auto"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className={`transition-all overflow-hidden ${showFilters ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                } w-full`}
            >
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/10 bg-[#0a1b30]/60 w-full">
                {/* Score filter */}
                <Select
                  value={scoreFilter}
                  onValueChange={(v: ScoreFilter) => setScoreFilter(v)}
                >
                  <SelectTrigger className="w-full sm:min-w-40 sm:w-auto h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.score") || "Ball"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all")}
                    </SelectItem>
                    <SelectItem value="80plus">≥ 80</SelectItem>
                    <SelectItem value="60to79">60 – 79</SelectItem>
                    <SelectItem value="55to59">55 – 59</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={resultFilter}
                  onValueChange={(v: ResultFilter) => setResultFilter(v)}
                >
                  <SelectTrigger className="w-full sm:min-w-40 sm:w-auto h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.result") || "Natija"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all")}
                    </SelectItem>
                    <SelectItem value="passed">
                      {t("applicationsPage.filters.passed")}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("applicationsPage.filters.failed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-col sm:flex-row items-center gap-2 px-2 w-full sm:w-auto">
                  <label className="text-sm text-gray-400">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 w-full sm:w-auto [color-scheme:dark]"
                  />

                  <label className="text-sm text-gray-400">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      if (fromDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 w-full sm:w-auto [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            <div className="antd-dark-table mt-1 overflow-x-auto pb-2">
              <div className="min-w-[800px]">
                <Table
                  className="antd-dark-table"
                  columns={tableColumns}
                  dataSource={filteredApplications}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    className: "custom-pagination",
                    current: currentPage,
                    pageSize: limit,
                    total: totalItems,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setLimit(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "15"],
                    locale: {
                      items_per_page:
                        t("applicationsPage.pagination.rowsPerPage") || "/ page",
                    },
                  }}
                  scroll={{ x: true }}
                  locale={{
                    emptyText: (
                      <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                          <Users className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {searchTerm
                            ? t("applicationsPage.empty.noResults")
                            : t("applicationsPage.empty.noApplications")}
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          {searchTerm
                            ? t("applicationsPage.empty.searchAgain")
                            : t("applicationsPage.empty.createFirst")}
                        </p>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl overflow-x-auto">
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 items-stretch md:items-center md:flex-row">
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("applicationsPage.search.placeholder")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 sm:pl-12 w-full md:w-[300px] lg:w-[400px] pr-4 py-2 sm:py-3 max-h-10 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-0 h-10 rounded-xl border border-white/10 bg-[#0a1b30]/60 hover:bg-[#0f2140] text-white text-sm sm:text-base w-full md:w-auto"
                aria-expanded={showFilters}
              >
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("applicationsPage.filters.title") || "Filtrlar"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {user?.role === "admin" ? null : (
                  <div>
                    <Select
                      value={selectedSite ? JSON.stringify(selectedSite) : ""}
                      onValueChange={(val: string) => {
                        try {
                          const site = val ? JSON.parse(val) : null;
                          setSelectedSite(site);
                          if (apiService.setSite) {
                            apiService.setSite(
                              site?.public_key ?? null,
                              site?.site_domain ?? null
                            );
                          }
                        } catch {
                          setSelectedSite(null);
                          if (apiService.setSite)
                            apiService.setSite(null, null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-auto sm:max-w-48 min-h-10 h-10 sm:min-w-34 max-h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue>
                          {selectedSite
                            ? selectedSite.site_name ?? selectedSite.name
                            : t("applicationsPage.siteSelect.placeholder")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1b30] border border-white/10 text-white max-h-60 overflow-y-auto">
                        {user?.sites?.map((site: Site, i: number) => {
                          const siteName =
                            site.site_name ?? site.name ?? "unknown";
                          const count = unseenCountsBySite[siteName] ?? 0;

                          return (
                            <SelectItem
                              key={`${site.id}-${i}`}
                              value={JSON.stringify(site)}
                              className="flex justify-between items-center text-white cursor-pointer"
                            >
                              <span>{siteName}</span>
                              {count > 0 && (
                                <span className="ml-2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                                  {unseenCountsBySite[siteName]}
                                </span>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <button
                  onClick={fetchVideoLists}
                  disabled={loading}
                  className="flex cursor-pointer items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-3.5 max-h-10 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("applicationsPage.refreshButton")}
                </button>
                <button
                  onClick={downloadExcel}
                  disabled={loading}
                  className="flex cursor-pointer items-center gap-2 px-3 sm:px-5 py-2 sm:py-3.5 max-h-10 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 w-full sm:w-auto"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className={`transition-all overflow-hidden ${showFilters ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                } w-full`}
            >
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/10 bg-[#0a1b30]/60 w-full">
                {/* Score filter */}
                <Select
                  value={scoreFilter}
                  onValueChange={(v: ScoreFilter) => setScoreFilter(v)}
                >
                  <SelectTrigger className="w-full sm:min-w-40 sm:w-auto h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.score") || "Ball"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all")}
                    </SelectItem>
                    <SelectItem value="80plus">≥ 80</SelectItem>
                    <SelectItem value="60to79">60 – 79</SelectItem>
                    <SelectItem value="55to59">55 – 59</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={resultFilter}
                  onValueChange={(v: ResultFilter) => setResultFilter(v)}
                >
                  <SelectTrigger className="w-full sm:min-w-40 sm:w-auto h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.result") || "Natija"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all")}
                    </SelectItem>
                    <SelectItem value="passed">
                      {t("applicationsPage.filters.passed")}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("applicationsPage.filters.failed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-col sm:flex-row items-center gap-2 px-2 w-full sm:w-auto">
                  <label className="text-sm text-gray-400">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 w-full sm:w-auto [color-scheme:dark]"
                  />

                  <label className="text-sm text-gray-400">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      if (fromDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 w-full sm:w-auto [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            <div className="antd-dark-table mt-1 overflow-x-auto pb-2">
              <div className="min-w-[800px]">
                <Table
                  className="antd-dark-table"
                  columns={tableColumns3}
                  dataSource={filteredVideoLists}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    className: "custom-pagination",
                    current: currentPage,
                    pageSize: limit,
                    total: totalItems,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setLimit(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "15"],
                    locale: {
                      items_per_page:
                        t("applicationsPage.pagination.rowsPerPage") || "/ page",
                    },
                  }}
                  scroll={{ x: true }}
                  locale={{
                    emptyText: (
                      <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                          <Users className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {searchTerm
                            ? t("applicationsPage.empty.noResults")
                            : t("applicationsPage.empty.noApplications")}
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          {searchTerm
                            ? t("applicationsPage.empty.searchAgain")
                            : t("applicationsPage.empty.createFirst")}
                        </p>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl overflow-x-auto">
            {/* Search / Toggle Filters / Site / Refresh */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6 items-center">
              {/* Search */}
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("applicationsPage.search.placeholder")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 w-[400px] pr-4 py-3 max-h-10 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Toggle Filters button (filtrlar panelini ochib-yopadi) */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-white/10 bg-[#0a1b30]/60 hover:bg-[#0f2140] text-white"
                aria-expanded={showFilters}
              >
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("applicationsPage.filters.title") || "Filtrlar"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div className="flex flex-row gap-2">
                {user?.role === "admin" ? null : (
                  <div>
                    <Select
                      value={selectedSite ? JSON.stringify(selectedSite) : ""}
                      onValueChange={(val: string) => {
                        try {
                          const site = val ? JSON.parse(val) : null;
                          setSelectedSite(site);
                          if (apiService.setSite) {
                            apiService.setSite(
                              site?.public_key ?? null,
                              site?.site_domain ?? null
                            );
                          }
                        } catch {
                          setSelectedSite(null);
                          if (apiService.setSite)
                            apiService.setSite(null, null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-auto max-w-48 min-h-10 h-10 min-w-34 max-h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                        <SelectValue>
                          {selectedSite
                            ? selectedSite.site_name ?? selectedSite.name
                            : t("applicationsPage.siteSelect.placeholder")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1b30] border border-white/10 text-white max-h-60 overflow-y-auto">
                        {user?.sites?.map((site: Site, i: number) => (
                          <SelectItem
                            className="text-white cursor-pointer"
                            key={`${site.id}-${i}`}
                            value={JSON.stringify(site)}
                          >
                            {site.site_name ?? site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="flex cursor-pointer items-center gap-2 px-5 py-3.5 max-h-10 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("applicationsPage.refreshButton")}
                </button>
              </div>
            </div>

            <div
              className={`transition-all overflow-hidden ${showFilters ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
            >
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/10 bg-[#0a1b30]/60">
                {/* Score filter */}
                <Select
                  value={scoreFilter}
                  onValueChange={(v: ScoreFilter) => setScoreFilter(v)}
                >
                  <SelectTrigger className="min-w-40 h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.score") || "Ball"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all") || "Hammasi"}
                    </SelectItem>
                    <SelectItem value="80plus">≥ 80</SelectItem>
                    <SelectItem value="60to79">60 – 79</SelectItem>
                    <SelectItem value="55to59">55 – 59</SelectItem>
                  </SelectContent>
                </Select>

                {/* Result filter */}
                <Select
                  value={resultFilter}
                  onValueChange={(v: ResultFilter) => setResultFilter(v)}
                >
                  <SelectTrigger className="min-w-40 h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                    <SelectValue
                      placeholder={
                        t("applicationsPage.filters.result") || "Natija"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                    <SelectItem value="all">
                      {t("applicationsPage.filters.all") || "Hammasi"}
                    </SelectItem>
                    <SelectItem value="passed">
                      {t("applicationsPage.filters.passed") || "O'tgan"}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("applicationsPage.filters.failed") || "O'tolmagan"}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Date filter */}
                <div className="flex items-center gap-2 px-2">
                  <label className="text-sm text-gray-400">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 [color-scheme:dark]"
                  />

                  <label className="text-sm text-gray-400">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      if (fromDate || e.target.value) filterByDate();
                    }}
                    className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white px-3 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Ant Design Table */}
            <div className="antd-dark-table mt-1 overflow-x-auto pb-2">
              <div className="min-w-[800px]">
                <Table
                  className="antd-dark-table"
                  columns={tableColumn2}
                  dataSource={filterAcceptedApplications}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    className: "custom-pagination",
                    current: currentPage,
                    pageSize: limit,
                    total: totalAccepted,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setLimit(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "15"],
                    locale: {
                      items_per_page:
                        t("applicationsPage.pagination.rowsPerPage") || "/ page",
                    },
                  }}
                  scroll={{ x: true }}
                  locale={{
                    emptyText: (
                      <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                          <Users className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {searchTerm
                            ? t("applicationsPage.empty.noResults")
                            : t("applicationsPage.empty.noApplications")}
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          {searchTerm
                            ? t("applicationsPage.empty.searchAgain")
                            : t("applicationsPage.empty.createFirst")}
                        </p>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main */}
        </TabPanel>
       
      </Tabs>

      {isChatOpen && selectedApplication && (
        <ChatModal
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          sessionId={selectedApplication.session_id}
          applicantName={selectedApplication.name}
        />
      )}
      {isVideoChatOpen && selectedApplicationVideo   && (
        <VideoChatModal
          open={isVideoChatOpen}
          onClose={() => setIsVideoChatOpen(false)}
          sessionId={selectedApplicationVideo.session_id}
          videoUrl={selectedApplicationVideo.video_url || ""}
          name={selectedApplicationVideo.name}
        />
      )}

      {user?.role === "admin" ? null : (
        <CallToInterview
          open={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          name={selectedApplicationForCall?.name}
          phone={selectedApplicationForCall?.phonenumber}
          vacancy={selectedApplicationForCall?.vakansiya_title || ""}
          siteName={selectedApplicationForCall?.site_name || ""}
          vakandId={selectedApplicationForCall?.id}
          onSubmit={(data) => {
            console.log("Yuborilgan:", data);
            if (
              selectedApplicationForCall &&
              (selectedApplicationForCall.is_new ||
                !selectedApplicationForCall.viewed)
            ) {
              markAsViewedMutation.mutate(selectedApplicationForCall.id);
              markAsViewedVideoMutation.mutate(selectedApplicationForCall.id);
            }
          }}
        />
      )}

      {vacancyIdParam && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a1b30] border-t border-white/10 p-4 z-40 transition-transform duration-300 transform translate-y-0">
          <div className="max-w-7xl mx-auto">
            <details className="group">
              <summary
                onClick={async (e) => {
                  const isOpen = (e.currentTarget.parentElement as HTMLDetailsElement).open;
                  // Logic: The click happens *before* the toggle state changes in DOM for <details> usually, 
                  // but here we want to fetch when it OPENS. 
                  // If it is currently closed (open=false), it is about to open.
                  if (!isOpen && selectedSite?.public_key && selectedSite.site_domain) {
                    try {
                      console.log("Fetching recommendation...");
                      const data = await apiService.getRecommendation(
                        Number(vacancyIdParam),
                        selectedSite.public_key,
                        selectedSite.site_domain,
                        token || ""
                      );
                      console.log("Recommendation Data:", data);
                    } catch (err) {
                      console.error("Error fetching recommendation:", err);
                    }
                  }
                }}
                className="flex items-center justify-between cursor-pointer list-none text-white font-semibold text-lg hover:text-blue-400 transition-colors"
              >
                <span>Recommendation / Tavsiyalar</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown />
                </span>
              </summary>
              <div className="mt-4 p-4 text-gray-300 bg-white/5 rounded-lg border border-white/5">
                <p>Check the console for the Recommendation output.</p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
