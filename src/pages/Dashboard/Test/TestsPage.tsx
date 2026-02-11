// src/pages/tests/TestsPage.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiService } from "../../../services/api";
import type { CreateOrUpdateTestDto, TestItem } from "../../../types"

import TestFormModal from "../../../components/TestFormModal";
import {
  Globe,
  Plus,
  Settings,
  Trash2,
  MessageCircle,
  Copy,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import type { Vacancy } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import TestDeleteModal from "./TestDeleteModal";
import QuestionModal from "./QuestionModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

function toTashkentISO(datetimeLocal: string) {
  // guard empty / bad values
  if (!datetimeLocal || typeof datetimeLocal !== "string") return null;

  // datetime-local format: "YYYY-MM-DDTHH:mm"
  // Safari can be picky; parse manually.
  const m = datetimeLocal.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );
  if (!m) return null;

  const [, y, mo, d, h, mi] = m.map(String);

  // Create a Date in user's local timezone using components (safe cross-browser)
  const localDate = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    0
  );

  if (Number.isNaN(localDate.getTime())) return null;

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(localDate);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}T${get(
    "hour"
  )}:${get("minute")}:${get("second")}+05:00`;
}


export default function TestsPage() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [params] = useSearchParams();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [vacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<TestItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<TestItem | null>(null);
  const [scheduledAiTime, setScheduledAiTime] = useState<string>("");
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [currentTestData, setCurrentTestData] =
    useState<CreateOrUpdateTestDto | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAiOpen, setModalAiOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

  const publicKey = params.get("public_key");
  const siteDomain = params.get("site_domain");

  useEffect(() => {
    if (publicKey || siteDomain) {
      apiService.setSite(publicKey, siteDomain);
    }
  }, [publicKey, siteDomain]);

  // const loadAll = async () => {
  //   if (!token) return;
  //   try {
  //     setLoading(true);
  //     const [vac, testsResp] = await Promise.all([
  //       apiService.getAllVacancies(token),
  //       apiService.getTests(token),
  //     ]);
  //     setVacancies(vac);
  //     setTests(testsResp?.data ?? []);
  //   } catch (e: any) {
  //     console.error("Failed to load data:", e);
  //     const errorMessage =
  //       e?.response?.data?.message ||
  //       e?.message ||
  //       t("testsPage.errors.loadData");
  //     toast.error(errorMessage, { position: "top-right", autoClose: 4000 });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadAll();
  // }, [token]);

  const loadTestsPage = async (limit: number, offset: number) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://ai.tenzorsoft.uz/show_tests?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tests");
      const data = await res.json();
      setTests(data?.data ?? []);
      setTotalItems(data?.total ?? data?.count ?? 0);
    } catch (err) {
      console.error("Error loading tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (option === "Schedule Meeting") {
      setModalOpen(true);
    } else if (option === "Schedule Ai Video") {
      setModalAiOpen(true);
    } else {
      console.log(option);
    }
  };

  const handleVideoAssessmentSubmit = async () => {
    if (!token || !selectedTest) {
      toast.error("Please select a test");
      return;
    }

    try {
      setBusy(true);
      const starts_at = toTashkentISO(scheduledAiTime);
      if (!starts_at) {
        toast.error(t("testsPage.toasts.timeError.time"));
        return;
      }
      const site = user?.sites?.[0];
      const vakansiya_id = Number((selectedTest || "").toString().split(":")[0]);
      const response = await apiService.CreateTestLinkVideo(
        vakansiya_id,
        site?.public_key || "",
        starts_at
      );

      const finalUrl = `https://my.jobx.uz/video-assessment?token=${response.token}`;

      setGeneratedLink(finalUrl);
      setShowLinkModal(true);
      setModalAiOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create video link");
    } finally {
      setBusy(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!token || !selectedTest || !scheduledTime) {
      toast.error("Please select a test and time");
      return;
    }
    try {
      setBusy(true);

      const site = user?.sites?.[0];

      if (!site) {
        toast.error("No site is configured for this user");
        return;
      }
      const date = new Date(scheduledTime);

      const pad = (n: number) => n.toString().padStart(2, "0");
      const starts_at = `${date.getFullYear()}-${pad(
        date.getMonth() + 1
      )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}+05:00`;

      const vakansiya_id = Number((selectedTest || "").toString().split(":")[0]);
      const response = await apiService.CreateTestLink(
        vakansiya_id,
        site.public_key || "",
        site.site_domain || "",
        starts_at
      );

      const baseUrl = "https://my.jobx.uz/test/interview";
      const newUrl = new URL(baseUrl);

      newUrl.searchParams.set("testId", response.test.id.toString());
      newUrl.searchParams.set("token", response.token);

      const finalUrl = newUrl.toString();
      setGeneratedLink(finalUrl);
      setShowLinkModal(true);
      setModalOpen(false);
    } catch (err: any) {
      console.error("Failed:", err);
      toast.error(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const offset = (currentPage - 1) * limit;
    loadTestsPage(limit, offset);
  }, [limit, currentPage]);

  const totalPages = Math.ceil(totalItems / limit);

  const buildChatLink = (testId: number) => {
    const nextParams = new URLSearchParams(params);

    nextParams.set("testId", String(testId));

    if (!(nextParams.get("public_key") || "").trim()) {
      nextParams.delete("public_key");
    }
    if (!(nextParams.get("site_domain") || "").trim()) {
      nextParams.delete("site_domain");
    }

    const query = nextParams.toString();
    return query ? `/dashboard/interview?${query}` : "/dashboard/interview";
  };

  const onCreate = async (values: CreateOrUpdateTestDto) => {
    if (!token) return;
    setBusy(true);

    const toastId = toast.loading(t("testsPage.toasts.create.loading"), {
      position: "top-right",
    });

    try {
      const response = await apiService.createQuestion(values as any, token);

      // Store the response and test data for later use
      const responseText =
        typeof response?.data === "string"
          ? response.data
          : JSON.stringify(response?.answer ?? {}, null, 2);

      setApiResponse(responseText);
      setCurrentTestData(values);

      // Close the TestFormModal
      setOpenModal(false);
      setEditing(null);

      // Open QuestionModal
      setQuestionModalOpen(true);

      toast.update(toastId, {
        render: t("testsPage.toasts.create.success"),
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (e: any) {
      console.error("Failed to create question:", e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        t("testsPage.toasts.create.error");
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setBusy(false);
    }
  };

  const onUpdate = async (values: CreateOrUpdateTestDto) => {
    if (!token || !editing) return;
    setBusy(true);

    const toastId = toast.loading(t("testsPage.toasts.update.loading"), {
      position: "top-right",
    });

    try {
      await apiService.updateTest(editing.id, values, token);
      toast.update(toastId, {
        render: t("testsPage.toasts.update.success"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setEditing(null);
      setOpenModal(false);
      await loadTestsPage(limit, (currentPage - 1) * limit);
    } catch (e: any) {
      console.error("Failed to update test:", e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        t("testsPage.toasts.update.error");
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteTest = async () => {
    if (!token || !testToDelete) return;

    const toastId = toast.loading(t("testsPage.toasts.delete.loading"), {
      position: "top-right",
    });

    try {
      await apiService.deleteTest(testToDelete.id, token);
      toast.update(toastId, {
        render: t("testsPage.toasts.delete.success"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTests((prev) => prev.filter((tst) => tst.id !== testToDelete.id));
      setDeleteModalOpen(false);
      setTestToDelete(null);
    } catch (e: any) {
      console.error("Failed to delete test:", e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        t("testsPage.toasts.delete.error");
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const handleQuestionSubmit = async (
    editedQuestion: string,
    timeMinutes: number
  ) => {
    if (!token || !currentTestData) return;

    const toastId = toast.loading("Creating test...", {
      position: "top-right",
    });

    try {
      // Convert string to array of questions, filtering out empty strings
      const questionsArray = editedQuestion
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q);

      const finalTestData = {
        ...currentTestData,
        test_question: questionsArray,
        time_minut: Number(timeMinutes),
      };
      await apiService.createTest(finalTestData, token, publicKey, siteDomain);

      toast.update(toastId, {
        render: "Test created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setQuestionModalOpen(false);
      setCurrentTestData(null);
      setApiResponse("");
      await loadTestsPage(limit, (currentPage - 1) * limit);
    } catch (e: any) {
      console.error("Failed to create test:", e);
      const errorMessage =
        e?.response?.data?.detail?.[0]?.msg ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to create test";
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="min-w-[300px]">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t("testsPage.header.title")}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">{t("testsPage.header.subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
            className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {t("testsPage.actions.newTest")}
          </button>{" "}
          <div className="flex w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                className="w-full sm:w-auto px-4 py-2 justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                {t("testsPage.schedule.actions")}
              </button>

              {showScheduleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowScheduleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f172a] border border-white/10 shadow-2xl z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        handleOptionClick("Schedule Meeting");
                        setShowScheduleDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-green-500/10 hover:text-green-400 flex items-center gap-3 transition"
                    >
                      {t("testsPage.schedule.meeting")}
                    </button>
                    <button
                      onClick={() => {
                        handleOptionClick("Schedule Ai Video");
                        setShowScheduleDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 border-t border-white/5 flex items-center gap-3 transition"
                    >
                      {t("testsPage.schedule.aiVideo")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full sm:w-1/3 bg-gradient-to-br mb-6 from-[#0f2a43]/60 to-[#0a1b30]/60 
  backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/30 
  transition-all group"
      >
        <div className="flex items-center gap-4">
          <div
            className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 
      border border-purple-500/30 group-hover:scale-110 transition-transform"
          >
            <Globe className="h-6 w-6 text-purple-400" />
          </div>

          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              {t("testsPage.stats.totalTests")}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              {totalItems}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-400">
          {publicKey && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300">
              <Globe className="w-4 h-4" /> {t("testsPage.pkSet")}{" "}
              {publicKey.slice(0, 6)}…
            </span>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {t("testsPage.list.title")}
          </h2>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400">{t("testsPage.loading")}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
              <Globe className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {t("testsPage.empty.title")}
            </h3>
            <p className="text-gray-400">{t("testsPage.empty.description")}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tests.map((tst) => (
              <div
                key={tst.id}
                className="p-6 hover:bg-white/5 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {tst.position_name} —{" "}
                      <span className="text-blue-300">{tst.position_role}</span>
                    </h3>
                    <div className="text-sm text-gray-400 mb-2">
                      {t("testsPage.vacancyId")}:{" "}
                      <span className="text-gray-200">{tst.vakansiya_id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* <LanguagePicker
                      value={tst.lang || "uz"}
                      onChange={(val) =>
                        setTests((prev) =>
                          prev.map((x) =>
                            x.id === tst.id ? { ...x, lang: val } : x
                          )
                        )
                      }
                    /> */}

                    <button
                      onClick={() => {
                        setEditing(tst);
                        setOpenModal(true);
                      }}
                      disabled={busy}
                      className="flex-1 sm:flex-none justify-center cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl disabled:opacity-50"
                    >
                      <Settings className="w-4 h-4" />
                      {/* {t("testsPage.actions.edit")} */}
                    </button>
                    <button
                      onClick={() => {
                        setTestToDelete(tst);
                        setDeleteModalOpen(true);
                      }}
                      disabled={busy}
                      className="flex flex-1 sm:flex-none justify-center cursor-pointer items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("testsPage.actions.delete")}
                    </button>
                    <Link
                      to={buildChatLink(tst.id)}
                      className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("testsPage.actions.startInterview")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <TestDeleteModal
              open={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onConfirm={confirmDeleteTest}
              testTitle={testToDelete?.position_name}
              isLoading={busy}
            />
          </div>
        )}
      </div>
      <TestFormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        initial={editing}
        vacancies={vacancies}
        loading={busy}
        title={
          editing
            ? t("testsPage.modal.editTitle")
            : t("testsPage.modal.createTitle")
        }
        onSubmit={editing ? onUpdate : onCreate}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#0a1b30]/95 p-6 border border-white/10">
            <h2 className="text-lg font-medium text-white mb-5">
              {t("testsPage.schedule.meeting")}
            </h2>

            {/* Test Select */}
            <Select
              value={selectedTest ?? ""}
              onValueChange={(val) => setSelectedTest(val)}
            >
              <SelectTrigger className="w-full h-10 py-5 rounded-lg bg-[#0a1b30] border border-white/10 text-white">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>

              <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                {tests
                  .filter((test) => test.vakansiya_id !== null && test.vakansiya_id !== undefined)
                  .map((test) => (
                    <SelectItem key={test.id} value={`${test.vakansiya_id}:${test.id}`}>
                      {test.position_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full mt-4 h-10 px-3 rounded-lg bg-[#0a1b30]/80 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                onClick={handleScheduleSubmit}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#0a1b30]/95 p-6 border border-white/10">
            <h2 className="text-lg font-medium text-white mb-5">
              {t("testsPage.schedule.aiVideo")}
            </h2>
            <Select
              value={selectedTest ?? ""}
              onValueChange={(val) => setSelectedTest(val)}
            >
              <SelectTrigger className="w-full h-10 py-5 rounded-lg bg-[#0a1b30] border border-white/10 text-white">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>

              <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                {tests
                  .filter((test) => test.vakansiya_id !== null && test.vakansiya_id !== undefined)
                  .map((test) => (
                    <SelectItem key={test.id} value={`${test.vakansiya_id}:${test.id}`}>
                      {test.position_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <input
              type="datetime-local"
              value={scheduledAiTime}
              onChange={(e) => setScheduledAiTime(e.target.value)}
              className="w-full mt-4 h-10 px-3 rounded-lg bg-[#0a1b30]/80 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
            />
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition"
                onClick={() => setModalAiOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                onClick={handleVideoAssessmentSubmit}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {showLinkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a1b30] p-8 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-2">
              Invitation Link Ready
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Copy this link and send it to the candidate.
            </p>

            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/10 mb-6">
              <input
                readOnly
                value={generatedLink || ""}
                className="bg-transparent text-gray-300 text-sm flex-1 outline-none truncate"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink || "");
                }}
                className="
      flex items-center gap-2
      px-3 py-2
      rounded-lg
      bg-white/5
      text-gray-300
      border border-white/10
      hover:bg-white/10
      hover:text-white
      active:scale-95
      transition-all
    "
                title="Copy link"
              >
                <Copy size={16} />
              </button>
            </div>

            <button
              className="w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium"
              onClick={() => {
                setShowLinkModal(false);
                setGeneratedLink(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <QuestionModal
        open={questionModalOpen}
        initialQuestion={apiResponse}
        onClose={() => {
          setQuestionModalOpen(false);
          setCurrentTestData(null);
          setApiResponse("");
        }}
        onSubmit={handleQuestionSubmit}
        loading={busy}
      />

      {/* Pagination */}
      <div className="mt-6 w-full flex flex-wrap items-center justify-between gap-4">
        {/* select pagination limit */}
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm text-gray-400 whitespace-nowrap min-w-[90px]">
            {t("applicationsPage.pagination.rowsPerPage")}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-[#0a1b30] border border-white/10 text-white min-w-[70px]">
              <SelectValue
                placeholder={t("applicationsPage.pagination.select")}
              />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 flex justify-center">
          <Pagination className="text-white">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
              </PaginationItem>

              <span className="text-sm mx-3">
                {currentPage} {t("applicationsPage.pagination.of")}{" "}
                {totalPages || 1}
              </span>

              <PaginationItem>
                <PaginationNext
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* balance uchun (joylashuv) */}
        <div className="min-w-[90px]"></div>
      </div>
    </div>
  );
}
