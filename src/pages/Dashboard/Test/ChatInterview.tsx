import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../../../services/api";
import {
  ArrowLeft,
  Send,
  Globe,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Award,
} from "lucide-react";
import type { ChatTestRequest, TestItem } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";
import { useWidgetConfig } from "../../../contexts/widgetContextCore";

/** —— Konstanta —— */
const MAX_WARNINGS = 1; // 1 marta ogohlantirish, keyingisi — Block

/** —— Yordamchi tiplashlar (Fullscreen vendor prefikslar uchun) —— */
interface VendorDocument extends Document {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
}

interface VendorDocumentElement extends HTMLElement {
  webkitRequestFullscreen?: (
    options?: FullscreenOptions
  ) => Promise<void> | void;
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

/** —— Yordamchi: xatoni xabar satriga aylantirish —— */
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Noma'lum xato.";
}

/** —— UUID —— */
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type IState =
  | "idle"
  | "gate" // Qoidalar + fullscreen talab qilinadi
  | "starting" // Fullscreen qabul qilindi, savol backenddan yuklanmoqda
  | "primed" // Birinchi savol keldi, 1-foydalanuvchi xabarini kutyapmiz (taymer hali boshlanmagan)
  | "active" // 1-foydalanuvchi xabaridan so'ng taymer ishlayapti
  | "warned" // Qoidabuzarlik — ogohlantirish (pauza)
  | "finished" // Vaqt tugadi
  | "blocked"; // Qoidalar takror buzildi yoki sahifa tark etildi

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  score?: number; // ✅ Score qo'shildi
}

export default function ChatInterview() {
  const { token } = useAuth();
  const { config } = useWidgetConfig();
  const [params] = useSearchParams();
  const publicKey =
    config?.publicKey ?? config?.public_key ?? "JhwH4LrDLnVgQ3GC";
  const navigate = useNavigate();

  const [selected, setSelected] = useState<TestItem | null>(null);

  const [sessionId, setSessionId] = useState<string>(uuid());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // ✅ Final score saqlash uchun
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [langChosen, setLangChosen] = useState(false);

  // Timer - sekundlarda
  const [timeLeft, setTimeLeft] = useState(0);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);

  // State
  const [state, setState] = useState<IState>("idle");
  const stateRef = useRef<IState>("idle");
  const warningsUsedRef = useRef<number>(0);
  const firstUserMsgSentRef = useRef<boolean>(false);

  // UI
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [fsError, setFsError] = useState<string>("");
  const [fsBtnBusy, setFsBtnBusy] = useState(false);
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz");

  // control
  const blockSentRef = useRef(false);
  const finishSentRef = useRef(false);
  const chatStartedRef = useRef(false);
  const isMountedRef = useRef(true);

  // pending nav
  const pendingNavRef = useRef<(() => void) | null>(null);

  // UI refs
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // "Savol yuklanmoqda…" xabarini almashtirish uchun id
  const firstLoadingIdRef = useRef<string | null>(null);

  // const publicKey = params.get("public_key");
  const siteDomain = params.get("site_domain");
  const selectedTestId = useMemo(() => {
    const raw = params.get("testId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);
  const interviewDurationSeconds = useMemo(() => {
    if (!selected) return 10 * 60;
    const mins = selected.time_minut ?? 10;
    return mins * 60;
  }, [selected]);

  useEffect(() => {
    if (publicKey || siteDomain)
      apiService.setSite(publicKey, siteDomain || undefined);
  }, [publicKey, siteDomain]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ---------- Timer helpers ----------
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    deadlineRef.current = null;
  }, []);

  const tick = useCallback((): number => {
    if (!deadlineRef.current) return 0;
    const diff = deadlineRef.current - Date.now();
    const remaining = Math.max(0, Math.floor(diff / 1000));
    setTimeLeft(remaining);
    return remaining;
  }, []);

  const startTimerNow = useCallback(() => {
    clearTimer();
    pausedRef.current = false;
    deadlineRef.current = Date.now() + timeLeft * 1000;
    timerRef.current = window.setInterval(() => {
      const left = tick();
      if (left <= 0) {
        clearTimer();
        (async () => {
          if (finishSentRef.current) return;
          finishSentRef.current = true;
          if (isMountedRef.current) {
            setState("finished");
            setError("Suhbat vaqti tugadi.");
            setMessages((p) => [
              ...p,
              { id: uuid(), role: "bot", text: "Suhbat vaqti tugadi." },
            ]);
          }
          try {
            await postChatMessage("Finish");
          } catch {
            /* swallow */
          }
        })();
      }
    }, 1000);
  }, [clearTimer, tick, timeLeft]);

  const pauseTimer = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    if (deadlineRef.current) {
      const left = Math.max(
        0,
        Math.floor((deadlineRef.current - Date.now()) / 1000)
      );
      setTimeLeft(left);
    }
    clearTimer();
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    clearTimer();
    deadlineRef.current = Date.now() + timeLeft * 1000;
    timerRef.current = window.setInterval(() => {
      const left = tick();
      if (left <= 0) {
        clearTimer();
        (async () => {
          if (finishSentRef.current) return;
          finishSentRef.current = true;
          if (isMountedRef.current) {
            setState("finished");
            setError("Suhbat vaqti tugadi.");
            setMessages((p) => [
              ...p,
              { id: uuid(), role: "bot", text: "Suhbat vaqti tugadi." },
            ]);
          }
          try {
            await postChatMessage("Finish");
          } catch {
            /* swallow */
          }
        })();
      }
    }, 1000);
  }, [clearTimer, tick, timeLeft]);

  // ---------- Fullscreen helpers ----------
  const isFSActive = (): boolean => {
    const d = document as VendorDocument;
    return !!(
      document.fullscreenElement ||
      d.webkitFullscreenElement ||
      d.msFullscreenElement
    );
  };

  const requestFS = useCallback(async () => {
    const el = document.documentElement as unknown as VendorDocumentElement;
    const fn =
      el.requestFullscreen?.bind(el) ||
      el.webkitRequestFullscreen?.bind(el) ||
      el.mozRequestFullScreen?.bind(el) ||
      el.msRequestFullscreen?.bind(el);

    if (!fn) throw new Error("Fullscreen bu brauzerda qo'llab-quvvatlanmaydi.");
    await Promise.resolve(fn({ navigationUI: "hide" } as FullscreenOptions));
  }, []);

  // ---------- API ----------
  const postChatMessage = useCallback(
    async (message: string) => {
      if (!token || !selected)
        throw new Error(
          "Suhbatni yuborish uchun autentifikatsiya talab qilinadi."
        );
      const body: ChatTestRequest = {
        message,
        position_name: selected.position_name,
        position_role: selected.position_role,
        test_question: selected.test_question,
        work_experiance: selected.work_experiance,
        session_id: sessionId,
        language: lang,
      };
      return apiService.chatTest(body, token, publicKey);
    },
    [token, selected, sessionId, lang]
  );

  // ---------- Data load ----------
  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const resp = await apiService.getTests(token);
      const data = (resp?.data ?? []) as TestItem[];
      if (!selectedTestId) {
        setError("Test ID topilmadi.");
        setSelected(null);
        return;
      }
      const found = data.find((t) => t.id === selectedTestId) ?? null;
      if (!found) {
        setError("Tanlangan test topilmadi yoki o'chirilgan.");
        setSelected(null);
        return;
      }
      setSelected(found);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Load tests error");
    }
  }, [token, selectedTestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAcceptRules = useCallback(async () => {
    if (fsBtnBusy) return;
    setFsError("");
    setFsBtnBusy(true);
    try {
      await requestFS();
      if (!isFSActive()) throw new Error("Fullscreen yoqilmadi.");
      chatStartedRef.current = true;
      setSessionId(uuid());
      warningsUsedRef.current = 0;
      setError("");
      setFinalScore(null); // ✅ Score reset
      setTimeLeft(interviewDurationSeconds);
      setLangChosen(false);
      setMessages([{ id: uuid(), role: "bot", text: "Intimos til tanlang!" }]);
      setState("primed");
    } catch (e: unknown) {
      setFsError(
        getErrorMessage(e) ||
          "Fullscreen yoqib bo'lmadi. Brauzer ruxsatini tekshiring."
      );
    } finally {
      setFsBtnBusy(false);
    }
  }, [requestFS, fsBtnBusy, interviewDurationSeconds]);

  // ---------- Guard — rule violations ----------
  const endWithBlock = useCallback(
    async (reason: string) => {
      if (blockSentRef.current) return;
      blockSentRef.current = true;
      pauseTimer();
      setState("blocked");
      setMessages((p) => [
        ...p,
        { id: uuid(), role: "bot", text: `Suhbat bloklandi. Sabab: ${reason}` },
      ]);
      try {
        await postChatMessage("Block");
      } catch {
        /* swallow */
      }
    },
    [pauseTimer, postChatMessage]
  );

  const handleViolation = useCallback(
    async (kind: "fullscreen" | "visibility" | "blur" | "navigation") => {
      if (!(stateRef.current === "active" || stateRef.current === "primed"))
        return;

      if (warningsUsedRef.current < MAX_WARNINGS) {
        warningsUsedRef.current += 1;
        pauseTimer();
        setState("warned");
        return;
      }

      await endWithBlock(
        kind === "fullscreen"
          ? "Fullscreen rejimdan chiqildi."
          : kind === "visibility"
          ? "Sahifa/yordamchi ilovaga o'tildi."
          : kind === "blur"
          ? "Ilova fokusdan chiqdi."
          : "Navigatsiya (sahifadan chiqish) urinishlari."
      );
    },
    [endWithBlock, pauseTimer]
  );
  const triggerInitialChat = useCallback(
    async (chosenLang: "uz" | "ru" | "en") => {
      setLang(chosenLang);
      setState("starting");
      const loadingId = uuid();
      firstLoadingIdRef.current = loadingId;
      setMessages([{ id: loadingId, role: "bot", text: "Yuklanmoqda..." }]);

      try {
        const body: ChatTestRequest = {
          message: "salom",
          position_name: selected!.position_name,
          position_role: selected!.position_role,
          test_question: selected!.test_question,
          work_experiance: selected!.work_experiance,
          session_id: sessionId,
          language: chosenLang, // Use the language just picked
        };

        const resp = await apiService.chatTest(body, token!, publicKey);
        const ans = resp?.data?.answer || "Savol berilmadi.";

        setMessages([{ id: uuid(), role: "bot", text: ans }]);
        setState("primed");
      } catch (e) {
        setError(getErrorMessage(e));
        setState("gate");
      }
    },
    [selected, sessionId, token, publicKey]
  );

  // Global listeners (primed va active holatlarda ham)
  useEffect(() => {
    if (!(state === "active" || state === "primed")) return;

    const onFSChange = () => {
      if (!isFSActive()) void handleViolation("fullscreen");
    };
    const onVisibility = () => {
      if (document.hidden) void handleViolation("visibility");
    };
    const onBlur = () => {
      void handleViolation("blur");
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stateRef.current === "active" || stateRef.current === "primed") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onPageHide = () => {
      if (stateRef.current === "active" || stateRef.current === "primed")
        void endWithBlock("Sahifa yopildi.");
    };
    const onPopState = (ev: PopStateEvent) => {
      if (stateRef.current === "active" || stateRef.current === "primed") {
        ev.preventDefault?.();
        window.history.pushState({ lock: true }, "", window.location.href);
        void handleViolation("navigation");
      }
    };

    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    window.history.pushState({ lock: true }, "", window.location.href);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("popstate", onPopState);
    };
  }, [state, handleViolation, endWithBlock]);

  // Cleanup — kutilmagan unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (
        (stateRef.current === "active" || stateRef.current === "primed") &&
        !blockSentRef.current &&
        token &&
        selected
      ) {
        blockSentRef.current = true;
        postChatMessage("Block").catch(() => {});
      }
    };
  }, [clearTimer, postChatMessage, selected, token]);

  // ---------- Load/reset by testId ----------
  useEffect(() => {
    chatStartedRef.current = false;
    blockSentRef.current = false;
    finishSentRef.current = false;
    warningsUsedRef.current = 0;
    firstUserMsgSentRef.current = false;

    clearTimer();
    firstLoadingIdRef.current = null;
    setMessages([]);
    setFinalScore(null); // ✅ Score reset
    // ✅ Testni tanlashda vaqtni qayta o'rnatish
    setTimeLeft(interviewDurationSeconds);
    setState("gate");
    setAgreeRules(false);
    setFsError("");
    setFsBtnBusy(false);
  }, [selectedTestId, clearTimer, interviewDurationSeconds]);

  // ---------- Actions ----------
  const formattedTimeLeft = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const sendMessage = async () => {
    if (!token || !selected) return;
    if (state === "blocked") {
      setError("Suhbat bloklangan.");
      return;
    }
    if (state === "finished") {
      setError("Suhbat yakunlangan.");
      return;
    }
    if (!(state === "active" || state === "primed")) {
      setError("Suhbat faol emas.");
      return;
    }
    if (!input.trim()) return;

    // ✅ Birinchi user xabarida — taymerni ishga tushiramiz
    if (state === "primed" && !firstUserMsgSentRef.current) {
      firstUserMsgSentRef.current = true;
      setTimeLeft((prev) => prev);
      startTimerNow();
      setState("active");
    }

    if (timeLeft <= 0) {
      setError("Suhbat vaqti tugagan.");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { id: uuid(), role: "user", text: userMsg }]);
    setBusy(true);
    setError("");
    try {
      const resp = await postChatMessage(userMsg);
      let ans =
        typeof resp?.data?.answer === "string"
          ? resp.data.answer
          : "Javob yo'q.";
      ans = ans.replace(/\(\s*"finished"\s*:\s*(true|false)\s*\)/gi, "");

      // ✅ Score tekshirish
      const score =
        typeof resp?.data?.score === "number" ? resp.data.score : undefined;

      if (score !== undefined) {
        setFinalScore(score);
      }

      setMessages((m) => [...m, { id: uuid(), role: "bot", text: ans, score }]);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Send error");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const requestExit = (next: () => void) => {
    if (stateRef.current === "active" || stateRef.current === "primed") {
      void handleViolation("navigation");
      pendingNavRef.current = next;
      setShowExitConfirm(true);
    } else {
      next();
    }
  };

  const confirmExit = async () => {
    setShowExitConfirm(false);
    const act = pendingNavRef.current;
    pendingNavRef.current = null;
    await endWithBlock("Suhbatdan chiqish tasdiqlandi.");
    act?.();
  };
  const cancelExit = () => {
    setShowExitConfirm(false);
    pendingNavRef.current = null;
  };

  // ---------- UI ----------
  const isInputDisabled =
    !selected ||
    state === "starting" ||
    state === "warned" ||
    state === "blocked" ||
    state === "finished";

  const inputPlaceholder =
    state === "gate"
      ? "Qoidalarga rozilik bildiring."
      : state === "starting"
      ? "Savol yuklanmoqda..."
      : state === "primed"
      ? "Javobingizni yozing..."
      : state === "warned"
      ? "Ogohlantirish: fullscreen'ga qayting."
      : state === "blocked"
      ? "Suhbat bloklangan."
      : state === "finished"
      ? "Suhbat yakunlangan."
      : "Javobingizni yozing...";

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">AI Interview</h1>
              {(state === "active" ||
                state === "starting" ||
                state === "primed") && (
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                  <ShieldAlert className="w-4 h-4" />
                  Proctor yoqilgan · Qolgan ogohlantirish:{" "}
                  {Math.max(0, MAX_WARNINGS - warningsUsedRef.current)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => requestExit(() => navigate("/dashboard/test"))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Ortga
            </button>
          </div>

          {/* Vacancy card */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-4">
            {selected ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Hozirgi vakansiya
                  </div>
                  <div className="text-white text-2xl font-semibold">
                    {selected.position_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Suhbat davomiyligi: {selected.time_minut ?? 10} minut
                  </div>
                  {/* ✅ Final score ko'rsatish */}
                  {finalScore !== null && (
                    <div className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40">
                      <Award className="w-5 h-5 text-amber-300" />
                      <span className="text-amber-100 font-semibold">
                        Sizning ballingiz: {finalScore}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {publicKey && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
                      <Globe className="w-4 h-4" /> PK set:{" "}
                      {publicKey.slice(0, 6)}...
                    </span>
                  )}
                  <button
                    onClick={() => selected && setState("gate")}
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 disabled:opacity-60 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Suhbatni qayta boshlash
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">
                {error || "Test ma'lumotlari topilmadi."}
              </div>
            )}
          </div>

          {/* Chat card */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-white">Suhbat</h2>
              {state !== "idle" && (
                <span
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-1.5 text-base font-semibold font-mono tracking-tight ${
                    state === "blocked"
                      ? "border-red-400/40 bg-red-500/10 text-red-200"
                      : state === "finished"
                      ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {state === "active" ||
                  state === "starting" ||
                  state === "primed" ||
                  state === "warned"
                    ? `Qolgan vaqt: ${formattedTimeLeft}`
                    : state === "finished"
                    ? "Suhbat vaqti tugadi"
                    : "Suhbat bloklandi"}
                </span>
              )}
            </div>

            <div
              ref={scrollRef}
              className="h-[460px] overflow-y-auto no-scrollbar chat-scroll p-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">
                  {selected
                    ? state === "gate"
                      ? "Qoidalarga rozilik bildiring va fullscreen yoqing."
                      : "AI suhbatini boshlash uchun bir necha soniya kuting."
                    : "Test ma'lumotlari yuklanmoqda yoki mavjud emas."}
                </div>
              ) : (
                messages.map((m, index) => {
                  const isUser = m.role === "user";
                  const isLoading = Boolean(
                    firstLoadingIdRef.current &&
                      m.id === firstLoadingIdRef.current &&
                      state === "starting"
                  );
                  const hasScore = m.score !== undefined;

                  if (index === 0 && !isUser && !langChosen) {
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col items-start gap-3"
                      >
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border bg-white/10 border-white/20 text-gray-100">
                          <p className="font-medium text-white">{m.text}</p>
                        </div>

                        <div className="flex gap-2 ml-1">
                          {(["uz", "ru", "en"] as const).map((l) => (
                            <button
                              key={l}
                              onClick={async () => {
                                setLang(l);
                                setLangChosen(true);
                                await triggerInitialChat(l);
                              }}
                              // Kept your exact classes for styling
                              className="px-3 py-1 rounded-md border border-white text-sm text-white hover:bg-white/10 transition-colors"
                            >
                              {l.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  // 👇 NORMAL MESSAGE RENDER
                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 transition-all duration-200 shadow-sm break-words border ${
                          isUser
                            ? "ml-auto bg-blue-500/20 border-blue-500/40 text-blue-100"
                            : "mr-auto bg-white/10 border-white/20 text-gray-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed flex items-center gap-2">
                          {!isUser && isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {m.text}
                        </p>

                        {/* ✅ Score — bot only */}
                        {!isUser && hasScore && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
                              <Award className="w-4 h-4 text-amber-300" />
                              <span className="text-sm text-amber-100 font-semibold">
                                Ball: {m.score}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  onBlur={() => {
                    if (stateRef.current === "active")
                      inputRef.current?.focus();
                  }}
                  disabled={isInputDisabled}
                  placeholder={inputPlaceholder}
                  className="flex-1 rounded-xl px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500"
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void sendMessage()}
                  disabled={isInputDisabled || busy || !input.trim()}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  Yuborish
                </button>
              </div>
              {error && (
                <div className="mt-2 text-red-300 text-sm">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Preflight: Qoidalar + Fullscreen talab (modal) */}
      {state === "gate" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#071226] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
              <h3 className="text-xl font-semibold text-white">
                Suhbat qoidalari
              </h3>
            </div>
            <ul className="list-disc list-inside text-blue-100/90 text-sm space-y-2">
              <li>
                Chat <b>to'liq ekran</b> rejimida o'tadi.
              </li>
              <li>
                Fullscreen'dan chiqish / boshqa oynaga o'tish{" "}
                <b>qoidabuzarlik</b> hisoblanadi.
              </li>
              <li>
                1-marta qoidabuzarlikda <b>ogohlantirish</b> beriladi (taymer
                pauza yoki primed holatida kutish).
              </li>
              <li>
                Qayta qoidabuzarlikda chat <b>yopiladi</b> va <b>Block</b>{" "}
                jo'natiladi.
              </li>
              <li>
                Suhbat davomiyligi: <b>{selected.time_minut ?? 10} minut</b>
              </li>
            </ul>

            <label className="flex items-start gap-2 text-sm text-blue-100/90">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
              />
              <span>Qoidalarga rozilik bildiraman.</span>
            </label>

            {fsError && (
              <div className="rounded-md border border-red-400/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
                {fsError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => requestExit(() => navigate("/dashboard/test"))}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/90 hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                disabled={!agreeRules || fsBtnBusy}
                onClick={() => void handleAcceptRules()}
                className="px-4 py-2 rounded-lg border border-purple-500/40 bg-purple-600/80 text-white hover:bg-purple-600 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {fsBtnBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Fullscreen'ga o'tish va boshlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Ogohlantirish: 1-buzilishda */}
      {state === "warned" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/30 bg-[#2b1b00] p-6 shadow-2xl space-y-4 text-amber-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Ogohlantirish</h3>
            </div>
            <p className="text-sm">
              Qoidalarga amal qilinmadi (fullscreen o'chirildi yoki boshqa
              oynaga o'tildi). Davom ettirish uchun to'liq ekranga qayting.
              Qayta buzilish — suhbatni yakunlaydi.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={async () => {
                  try {
                    await requestFS();
                    if (!isFSActive())
                      throw new Error("Fullscreen qayta yoqilmadi.");
                    setState(firstUserMsgSentRef.current ? "active" : "primed");
                    if (firstUserMsgSentRef.current) {
                      resumeTimer();
                    }
                    inputRef.current?.focus();
                  } catch {
                    // foydalanuvchi yana urinishi mumkin
                  }
                }}
                className="px-4 py-2 rounded-lg border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-50"
              >
                Fullscreen'ga qaytish va davom etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚪 Chiqish tasdig'i (Back/Ortga) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#071226] p-6 text-center shadow-2xl space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Suhbatdan chiqmoqchimisiz?
            </h3>
            <p className="text-sm text-blue-100/80">
              Chiqishni tasdiqlasangiz, qoidalar bo'yicha suhbat yakunlanadi va
              bloklanadi.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void confirmExit()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Chiqishni tasdiqlash
              </button>
              <button
                type="button"
                onClick={cancelExit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// score
