// import {
//   ChevronDown,
//   ChevronLeft,
//   ChevronUp,
//   Inbox,
//   RefreshCw,
//   Send,
//   UserRound,
//   SendHorizonal
// } from "lucide-react";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { accessToken } from "../contexts/authConstants";
// import { useWidgetConfig } from "../contexts/widgetContextCore";

// interface Message {
//   id: number;
//   type: "user" | "bot" | "system";
//   content: string;
//   timestamp: Date;
// }
// interface Vacancy {
//   id: number;
//   title: string;
//   description: string;
//   price: string;
//   valyuta: string;
//   from_price: number;
//   to_price: number;
// }
// interface APIResponse {
//   answer?: string;
//   output?: string;
//   message?: string;
//   next?: boolean;
//   vakansiya?: string;
//   file_name?: string;
//   finished?: boolean | null;
// }
// interface UploadResponse {
//   status: string;
//   url: string;
//   file_name: string;
//   detail?: string;
// }
// interface Translation {
//   department: string;
//   openChat: string;
//   placeholder: string;
//   loading: string;
//   noVacancies: string;
//   apply: string;
//   uploadResume: string;
//   createResume: string;
//   fileReady: string;
//   download: string;
//   errorUpload: string;
//   errorDownload: string;
//   errorApplication: string;
//   selectVacancy: string;
//   onlyPDF: string;
//   vacancySelected: string;
//   frontendDescription: string;
//   backendDescription: string;
//   resumeUploaded: string;
//   alreadyApplied: string;
//   applied: string;
//   contactSoon: string;
// }

// const APPLIED_VACANCIES_STORAGE_KEY = "jobx_applied_vacancy_ids";
// const ACTIVE_VACANCY_ID_STORAGE_KEY = "jobx_active_vacancy_id";

// type TokenCSSVar =
//   | "--ts-bg"
//   | "--ts-border"
//   | "--ts-header-bg"
//   | "--ts-header-text"
//   | "--ts-primary"
//   | "--ts-on-primary"
//   | "--ts-primary-weak"
//   | "--ts-on-primary-weak"
//   | "--ts-user-bubble"
//   | "--ts-on-user-bubble"
//   | "--ts-bot-bubble"
//   | "--ts-on-bot-bubble"
//   | "--ts-system-bubble"
//   | "--ts-on-system-bubble"
//   | "--ts-input-bg"
//   | "--ts-input-border";

// type TokenStyles = React.CSSProperties & Record<TokenCSSVar, string>;

// const IntegratedChatVacancySmall: React.FC = () => {
//   const { config } = useWidgetConfig();

//   const [language] = useState<string>("uz");
//   const t: Translation = {
//     department: "Kadrlar bo'limi",
//     openChat: "Bo'sh ish o'rinlari",
//     placeholder: "Savol yozing...",
//     loading: "Yuklanmoqda...",
//     noVacancies: "Hozirda vakansiya mavjud emas",
//     apply: "Ariza yuborish",
//     uploadResume: "Rezyume yuklash",
//     createResume: "Rezyume yaratish",
//     fileReady: "Fayl tayyor",
//     download: "Yuklab olish",
//     errorUpload: "Fayl yuklashda xatolik",
//     errorDownload: "Faylni yuklab olishda xatolik yuz berdi",
//     errorApplication: "Ariza yuborishda xatolik yuz berdi",
//     selectVacancy: "Vakansiya tanlanmagan",
//     onlyPDF: "Faqat PDF fayllarni yuklashingiz mumkin",
//     vacancySelected: 'Siz "{title}" vakansiyasiga topshiryapsiz',
//     frontendDescription:
//       "React, TypeScript, Tailwind CSS bilan ishlash tajribasi kerak.",
//     backendDescription: "Node.js, Express, MongoDB bilan ishlash.",
//     resumeUploaded: "Rezyume yuklandi",
//     alreadyApplied: 'Siz avval "{title}" vakansiyasiga ariza topshirgansiz.',
//     applied: "Topshirildi",
//     contactSoon: "Siz bilan tez orada bog'lanamiz",
//   };

//   const themeName = (config?.theme ?? "").toLowerCase().trim();
//   const IS_GLASS = themeName === "glassmorphism";

//   const defaultTokensBase: TokenStyles = {
//     "--ts-bg": "#ffffff",
//     "--ts-border": "#E6E6EB",
//     "--ts-header-bg": "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
//     "--ts-header-text": "#ffffff",
//     "--ts-primary": "#2563eb",
//     "--ts-on-primary": "#ffffff",
//     "--ts-primary-weak": "#3b82f6",
//     "--ts-on-primary-weak": "#ffffff",
//     "--ts-user-bubble": "#eef2f7",
//     "--ts-on-user-bubble": "#0f172a",
//     "--ts-bot-bubble": "#3b82f6",
//     "--ts-on-bot-bubble": "#ffffff",
//     "--ts-system-bubble": "#f5f7fb",
//     "--ts-on-system-bubble": "#475569",
//     "--ts-input-bg": "#ffffff",
//     "--ts-input-border": "#E6E6EB",
//   };

//   const glassTokensBase: TokenStyles = {
//     "--ts-bg": "rgba(17, 25, 40, 0.28)",
//     "--ts-border": "rgba(255,255,255,0.22)",
//     "--ts-header-bg":
//       "linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(59,130,246,0.45) 100%)",
//     "--ts-header-text": "#E8F0FF",
//     "--ts-primary": "rgba(59,130,246,0.42)",
//     "--ts-on-primary": "#F8FAFC",
//     "--ts-primary-weak": "rgba(148,163,184,0.35)",
//     "--ts-on-primary-weak": "#F8FAFC",
//     "--ts-user-bubble": "rgba(148,163,184,0.32)",
//     "--ts-on-user-bubble": "#F8FAFC",
//     "--ts-bot-bubble": "rgba(59,130,246,0.38)",
//     "--ts-on-bot-bubble": "#F8FAFC",
//     "--ts-system-bubble": "rgba(15,23,42,0.42)",
//     "--ts-on-system-bubble": "#E2E8F0",
//     "--ts-input-bg": "rgba(255,255,255,0.12)",
//     "--ts-input-border": "rgba(255,255,255,0.28)",
//   };

//   const overridesRaw = {
//     btnColor: config?.btnColor ?? (config as any)?.bntColor,
//     btnTextColor: config?.btnTextColor ?? config?.textColor,
//     headerBg: config?.headerBg,
//     headerText: config?.headerText,
//     messageBg: config?.messageBg,
//     messageText: config?.messageText,
//     chatBg: config?.chatBg,
//     userMessageBg: config?.userMessageBg,
//     userMessageText: config?.userMessageText,
//   };
//   const overrides = Object.fromEntries(
//     Object.entries(overridesRaw).filter(([, v]) => v != null)
//   );
//   const hasOverrides = Object.keys(overrides).length > 0;

//   const base = IS_GLASS ? glassTokensBase : defaultTokensBase;

//   const tokensFromOverrides: Partial<TokenStyles> = {};
//   if (overrides.btnColor)
//     tokensFromOverrides["--ts-primary"] = overrides.btnColor as string;
//   if (overrides.btnTextColor)
//     tokensFromOverrides["--ts-on-primary"] = overrides.btnTextColor as string;

//   if (overrides.headerBg)
//     tokensFromOverrides["--ts-header-bg"] = overrides.headerBg as string;
//   if (overrides.headerText)
//     tokensFromOverrides["--ts-header-text"] = overrides.headerText as string;

//   if (overrides.messageBg) {
//     tokensFromOverrides["--ts-bot-bubble"] = overrides.messageBg as string;
//     tokensFromOverrides["--ts-primary-weak"] = overrides.messageBg as string;
//   }
//   if (overrides.messageText) {
//     tokensFromOverrides["--ts-on-bot-bubble"] = overrides.messageText as string;
//     tokensFromOverrides["--ts-on-primary-weak"] =
//       overrides.messageText as string;
//   }

//   if (overrides.userMessageBg)
//     tokensFromOverrides["--ts-user-bubble"] =
//       overrides.userMessageBg as string;
//   if (overrides.userMessageText)
//     tokensFromOverrides["--ts-on-user-bubble"] =
//       overrides.userMessageText as string;

//   if (overrides.chatBg) tokensFromOverrides["--ts-bg"] = overrides.chatBg as string;

//   const TOKENS: TokenStyles = useMemo(
//     () => ({ ...base, ...(hasOverrides ? tokensFromOverrides : {}) }),
//     [IS_GLASS, hasOverrides, JSON.stringify(tokensFromOverrides)]
//   );

//   const glassy = (extra?: React.CSSProperties): React.CSSProperties =>
//     IS_GLASS
//       ? {
//         backdropFilter: "blur(22px)",
//         WebkitBackdropFilter: "blur(22px)",
//         border: "1px solid var(--ts-border)",
//         boxShadow: "var(--ts-shadow)",
//         ...extra,
//       }
//       : { ...extra };

//   const btnStyle = (
//     variant: "primary" | "secondary",
//     disabled?: boolean,
//     extra?: React.CSSProperties
//   ): React.CSSProperties => {
//     if (disabled) {
//       return glassy({
//         background: IS_GLASS ? "rgba(148,163,184,0.28)" : "rgba(2,8,23,0.08)",
//         color: IS_GLASS ? "rgba(241,245,249,0.7)" : "rgba(2,6,23,0.55)",
//         cursor: "not-allowed",
//         boxShadow: "none",
//         ...extra,
//       });
//     }
//     const baseStyles =
//       variant === "primary"
//         ? { background: "var(--ts-primary)", color: "var(--ts-on-primary)" }
//         : {
//           background: "var(--ts-primary-weak)",
//           color: "var(--ts-on-primary-weak)",
//         };
//     return glassy({
//       ...baseStyles,
//       transition: "transform .15s ease, opacity .15s ease",
//       ...extra,
//     });
//   };

//   const bubbleStyle = (who: Message["type"]): React.CSSProperties => {
//     if (who === "user")
//       return glassy({
//         background: "var(--ts-user-bubble)",
//         color: "var(--ts-on-user-bubble)",
//         borderRadius: "16px 16px 4px 16px",
//       });
//     if (who === "bot")
//       return glassy({
//         background: "var(--ts-bot-bubble)",
//         color: "var(--ts-on-bot-bubble)",
//         borderRadius: "16px 16px 16px 4px",
//       });
//     return glassy({
//       background: "var(--ts-system-bubble)",
//       color: "var(--ts-on-system-bubble)",
//       borderRadius: "12px",
//     });
//   };

//   const primaryIsGradient = String(TOKENS["--ts-primary"])
//     .toLowerCase()
//     .includes("gradient");
//   const solidPrimaryForText = primaryIsGradient
//     ? (TOKENS["--ts-on-primary"] as string)
//     : (TOKENS["--ts-primary"] as string);

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState<string>("");
//   const [sessionId] = useState<string>(
//     () =>
//       "session_" +
//       Math.random().toString(36).substring(2, 15) +
//       Math.random().toString(36).substring(2, 15)
//   );
//   const [isTyping, setIsTyping] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [vacancies, setVacancies] = useState<Vacancy[]>([]);
//   const [isLoadingVacancies, setIsLoadingVacancies] = useState<boolean>(true);
//   const [expandedCard, setExpandedCard] = useState<number | null>(null);
//   const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
//   const [uploadedResume, setUploadedResume] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
//   const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [appliedVacancyIds, setAppliedVacancyIds] = useState<number[]>([]);
//   const [isFinished, setIsFinished] = useState<boolean>(false);
//   const [activeVacancyId, setActiveVacancyId] = useState<number | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const chatInputRef = useRef<HTMLInputElement>(null);

//   const chatApiUrl =
//     "https://ai.tenzorsoft.uz/chat?public_key=JhwH4LrDLnVgQ3GC&site_domain=https://tenzorsoft.com";
//   const uploadApiUrl = "https://ai.tenzorsoft.uz/upload";
//   const vacancyApiUrl = "https://ai.tenzorsoft.uz/show_vakansiya";
//   const downloadBaseUrl = "https://ai.tenzorsoft.uz/download/";

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Applied vacancies LS
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     try {
//       const stored = window.localStorage.getItem(APPLIED_VACANCIES_STORAGE_KEY);
//       if (!stored) return;
//       const parsed = JSON.parse(stored);
//       if (Array.isArray(parsed)) {
//         const normalized = parsed
//           .map((v) => Number(v))
//           .filter((v) => !Number.isNaN(v));
//         setAppliedVacancyIds(normalized);
//       }
//     } catch { }
//   }, []);
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     try {
//       window.localStorage.setItem(
//         APPLIED_VACANCIES_STORAGE_KEY,
//         JSON.stringify(appliedVacancyIds)
//       );
//     } catch { }
//   }, [appliedVacancyIds]);

//   // Active vacancy ID (persist in sessionStorage)
//   useEffect(() => {
//     try {
//       const saved = sessionStorage.getItem(ACTIVE_VACANCY_ID_STORAGE_KEY);
//       if (saved) {
//         const n = Number(saved);
//         if (!Number.isNaN(n)) setActiveVacancyId(n);
//       }
//     } catch { }
//   }, []);
//   useEffect(() => {
//     try {
//       if (activeVacancyId != null) {
//         sessionStorage.setItem(
//           ACTIVE_VACANCY_ID_STORAGE_KEY,
//           String(activeVacancyId)
//         );
//       } else {
//         sessionStorage.removeItem(ACTIVE_VACANCY_ID_STORAGE_KEY);
//       }
//     } catch { }
//   }, [activeVacancyId]);

//   const markVacancyAsApplied = (vacancyId: number) => {
//     setAppliedVacancyIds((prev) =>
//       prev.includes(vacancyId) ? prev : [...prev, vacancyId]
//     );
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, selectedVacancy, downloadFileName]);

//   const getSiteKey = () => config?.publicKey ?? "JhwH4LrDLnVgQ3GC";
//   const getUsername = () => config?.sourceOrigin ?? "https://tenzorsoft.com";
//   const defaultQueryNames = { public_key: "public_key", username: "username" };

//   const buildUrlWithAuth = (
//     base: string,
//     extraParams: Record<string, string> = {},
//     queryNames: Record<string, string> = defaultQueryNames
//   ) => {
//     const params: Record<string, string> = {
//       [queryNames.public_key]: getSiteKey(),
//       [queryNames.username]: getUsername(),
//       language,
//       ...extraParams,
//     };
//     const q = Object.entries(params)
//       .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
//       .join("&");
//     return base.includes("?") ? `${base}&${q}` : `${base}?${q}`;
//   };

//   const appendAuthToForm = (
//     formData: FormData,
//     queryNames: Record<string, string> = defaultQueryNames
//   ) => {
//     formData.append(queryNames.public_key, getSiteKey());
//     formData.append(queryNames.username, getUsername());
//     formData.append("language", language);
//   };

//   useEffect(() => {
//     loadVacancies();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [config]);

//   const loadVacancies = async () => {
//     setIsLoadingVacancies(true);
//     try {
//       const url = buildUrlWithAuth(
//         vacancyApiUrl,
//         {},
//         { public_key: "public_key", username: "site_domain" }
//       );
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           accept: "application/json",
//           ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//         },
//       });
//       if (response.ok) {
//         const data: Vacancy[] = await response.json();
//         setVacancies(data || []);
//       } else {
//         setVacancies([]);
//       }
//     } catch {
//       setVacancies([]);
//     } finally {
//       setIsLoadingVacancies(false);
//     }
//   };
// // siz bilan
//   const addMessage = (text: string, sender: "user" | "bot" | "system"): void => {
//     const newMessage: Message = {
//       id: Date.now() + Math.floor(Math.random() * 1000),
//       type: sender,
//       content: text,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, newMessage]);
//   };

//   const animateTyping = async (text: string): Promise<void> =>
//     new Promise((resolve) => {
//       setIsTyping(true);
//       let currentText = "";
//       let i = 0;
//       const interval = setInterval(() => {
//         if (i < text.length) {
//           const remaining = text.length - i;
//           const c = Math.floor(Math.random() * Math.min(4, remaining)) + 1;
//           for (let k = 0; k < c && i < text.length; k++) {
//             currentText += text.charAt(i);
//             i++;
//           }
//           setMessages((prev) => {
//             const arr = [...prev];
//             if (arr[arr.length - 1]?.type === "bot") {
//               arr[arr.length - 1].content = currentText;
//             }
//             return arr;
//           });
//         } else {
//           clearInterval(interval);
//           setIsTyping(false);
//           resolve();
//         }
//       }, 40);
//     });

//   const buildJsonHeaders = (): Record<string, string> => {
//     const headers: Record<string, string> = { "Content-Type": "application/json" };
//     if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
//     return headers;
//   };
//   const buildHeadersForForm = (): Record<string, string> => {
//     const headers: Record<string, string> = {};
//     if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
//     return headers;
//   };

//   // ===================== Always send vacancy ID (from activeVacancyId / session) =====================
//   const resolveVacancyId = (): number | null => {
//     let vid: number | null = activeVacancyId ?? selectedVacancy?.id ?? null;
//     if (vid == null) {
//       try {
//         const saved = sessionStorage.getItem(ACTIVE_VACANCY_ID_STORAGE_KEY);
//         if (saved) {
//           const n = Number(saved);
//           if (!Number.isNaN(n)) vid = n;
//         }
//       } catch { }
//     }
//     return vid;
//   };

//   const sendMessage = async (): Promise<void> => {
//     const messageText = inputMessage.trim();
//     if (messageText === "" || isLoading) return;

//     // Ensure vacancy id exists, otherwise block sending to avoid backend error
//     const vid = resolveVacancyId();
//     if (vid == null) {
//       addMessage(t.selectVacancy, "system");
//       return;
//     }

//     addMessage(messageText, "user");
//     setInputMessage("");
//     setIsLoading(true);
//     setIsTyping(true);
//     addMessage("", "bot");

//     try {
//       const requestData: Record<string, unknown> = {
//         message: messageText,
//         session_id: sessionId,
//         resume: uploadedResume,
//         public_key: getSiteKey(),
//         language,
//         vakansiya_id: vid, // <— ALWAYS send ID
//       };

//       const response = await fetch(chatApiUrl, {
//         method: "POST",
//         headers: buildJsonHeaders(),
//         body: JSON.stringify(requestData),
//       });
//       if (!response.ok) throw new Error(t.errorApplication);

//       const data: APIResponse = await response.json();
//       const responseText = data.answer || data.output || t.errorApplication;

//       if (data.finished === true) {
//         setIsFinished(true);
//       }
//       if (data.file_name) {
//         if (responseText) await animateTyping(responseText);
//         setDownloadFileName(data.file_name);
//         addMessage(`${t.fileReady}: ${data.file_name}`, "system");
//       } else {
//         await animateTyping(responseText);
//       }
//     } catch {
//       await animateTyping(t.errorApplication);
//     } finally {
//       setIsTyping(false);
//       setIsLoading(false);
//     }
//   };

//   const toggleCardExpansion = (vacancyId: number) =>
//     setExpandedCard(expandedCard === vacancyId ? null : vacancyId);

//   const handleApply = (vacancy: Vacancy) => {
//     if (appliedVacancyIds.includes(vacancy.id)) {
//       addMessage(t.alreadyApplied.replace("{title}", vacancy.title), "system");
//       return;
//     }
//     setSelectedVacancy(vacancy);
//     setActiveVacancyId(vacancy.id); // persist chosen vacancy id
//     addMessage(t.vacancySelected.replace("{title}", vacancy.title), "system");
//   };

//   const handleBackClick = () => {
//     setSelectedVacancy(null);
//     setActiveVacancyId(null); // clear persisted id
//     setMessages([]);
//     setUploadedResume("");
//     setDownloadFileName(null);
//     setIsFinished(false);
//     setMessages((prev) =>
//       prev.filter(
//         (m) =>
//           !(
//             m.type === "system" &&
//             typeof m.content === "string" &&
//             m.content.includes("vakansiyasiga")
//           )
//       )
//     );
//   };

//   const uploadFile = async (file?: File): Promise<void> => {
//     const pickedFile = file || fileInputRef.current?.files?.[0];
//     if (!pickedFile) return;
//     if (pickedFile.type !== "application/pdf") {
//       addMessage(t.onlyPDF, "system");
//       return;
//     }

//     const vid = resolveVacancyId();
//     if (vid == null) {
//       addMessage(t.selectVacancy, "system");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", pickedFile);
//     formData.append("session_id", sessionId);
//     appendAuthToForm(formData, { public_key: "public_key", username: "site_domain" });
//     formData.append("vakansiya_id", String(vid)); // <— ALWAYS send ID

//     try {
//       setIsSubmitting(true);
//       const loadingMessageId = Date.now() + Math.floor(Math.random() * 1000);
//       const loadingMessage: Message = {
//         id: loadingMessageId,
//         type: "system",
//         content: t.loading,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, loadingMessage]);

//       const response = await fetch(uploadApiUrl, {
//         method: "POST",
//         headers: buildHeadersForForm(),
//         body: formData,
//       });

//       setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));

//       if (response.ok) {
//         const res: UploadResponse = await response.json();
//         if (res.status === "success" && res.file_name && res.url) {
//           setUploadedResume(res.file_name);
//           addMessage(`${t.resumeUploaded}: ${res.file_name}`, "system");
//           await sendApplicationToAPI(true, res.file_name);
//         } else {
//           addMessage(`${t.errorUpload}: ${res.detail || "Noma'lum xatolik"}`, "bot");
//         }
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         addMessage(`${t.errorUpload}: ${errorData.detail || t.errorUpload}`, "bot");
//       }
//     } catch {
//       addMessage(t.errorUpload, "bot");
//     } finally {
//       setIsSubmitting(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const sendApplicationToAPI = async (hasResume: boolean, resumeFilename?: string) => {
//     const vid = resolveVacancyId();
//     if (vid == null) {
//       addMessage(t.selectVacancy, "system");
//       return;
//     }
//     try {
//       const message = hasResume ? t.uploadResume : t.createResume;
//       setIsTyping(true);
//       addMessage("", "bot");
//       const requestData: Record<string, unknown> = {
//         message,
//         session_id: sessionId,
//         resume: resumeFilename || "",
//         public_key: getSiteKey(),
//         site_domain: getUsername(),
//         language,
//         vakansiya_id: vid,
//       };
//       const response = await fetch(chatApiUrl, {
//         method: "POST",
//         headers: buildJsonHeaders(),
//         body: JSON.stringify(requestData),
//       });
//       if (response.ok) {
//         const data: APIResponse = await response.json();
//         const responseText = data.answer || data.output || t.apply;
//         if (data.finished === true) {
//           setIsFinished(true);
//           //
//           if (selectedVacancy?.id) {
//             markVacancyAsApplied(selectedVacancy.id);
//           } else if (vid) {
//             markVacancyAsApplied(vid);
//           }
//         }
//         setSelectedVacancy(null);
//         if (data.file_name) {
//           if (responseText) await animateTyping(responseText);
//           setDownloadFileName(data.file_name);
//           addMessage(`${t.fileReady}: ${t.fileReady}`, "system");
//         } else {
//           await animateTyping(responseText);
//         }
//       } else {
//         await animateTyping(t.errorApplication);
//       }
//     } catch {
//       await animateTyping(t.errorApplication);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleCreateResume = async () => {
//     const vid = resolveVacancyId();
//     if (vid == null) {
//       addMessage(t.selectVacancy, "system");
//       return;
//     }
//     setIsSubmitting(true);
//     await sendApplicationToAPI(false);
//     setIsSubmitting(false);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       if (!isLoading) sendMessage();
//     }
//   };

//   const truncateText = (text: string, limit: number) =>
//     text.length <= limit ? text : text.substring(0, limit) + "...";

//   const downloadFile = async (filename: string) => {
//     try {
//       const url = buildUrlWithAuth(
//         `${downloadBaseUrl}${encodeURIComponent(filename)}`,
//         {},
//         { public_key: "public_key", username: "site_domain" }
//       );
//       const res = await fetch(url, {
//         method: "GET",
//         headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
//       });
//       if (!res.ok) throw new Error(t.errorDownload);
//       const blob = await res.blob();
//       const link = document.createElement("a");
//       const href = window.URL.createObjectURL(blob);
//       link.href = href;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(href);
//       setDownloadFileName(null);
//     } catch {
//       addMessage(t.errorDownload, "bot");
//     }
//   };

//   const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) await uploadFile(file);
//   };

//   const triggerFileInput = () => fileInputRef.current?.click();

//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => chatInputRef.current?.focus(), 150);
//     }
//   }, [isOpen]);

//   const isSendDisabled = !inputMessage.trim() || isLoading;

//   // TOKENS'ni root'ga yozib qo'yish
//   useEffect(() => {
//     const root = document.getElementById("ts-widget-root");
//     if (!root) return;
//     Object.entries(TOKENS).forEach(([k, v]) => {
//       root.style.setProperty(k, String(v));
//     });
//   }, [TOKENS]);

//   // ------------------ Render ------------------
//   return (
//     <>
//       <style>{`
//         .chat-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
//         .chat-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
//         .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
//         .chat-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

//         .open-chat-button:hover { transform: translateY(-1px) scale(1.02); opacity: .98; }
//         .ts-shimmer { position: absolute; inset: -200%; transform: skewX(-12deg); background:
//           linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
//           animation: ts-shimmer 1.8s linear infinite; opacity: 0;
//         }
//         .open-chat-button:hover .ts-shimmer { opacity: 1; }
//         @keyframes ts-shimmer { 0% { transform: translateX(-60%) skewX(-12deg); }
//           100% { transform: translateX(60%) skewX(-12deg); } }

//         .ts-bubbles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
//         .ts-bubbles::before, .ts-bubbles::after{
//           content:""; position:absolute; width:220px; height:220px; border-radius:50%;
//           filter: blur(18px);
//         }
//         .ts-bubbles::before{
//           top:-40px; left:-30px;
//           background: radial-gradient(closest-side, rgba(255,255,255,.35), rgba(255,255,255,0));
//           opacity:.55; animation: floatA 9s ease-in-out infinite;
//         }
//         .ts-bubbles::after{
//           bottom:-50px; right:-50px;
//           background: radial-gradient(closest-side, rgba(59,130,246,.55), rgba(59,130,246,0));
//           opacity:.35; animation: floatB 11s ease-in-out infinite;
//         }
//         @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)}}
//         @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)}}

//         @media (max-width: 640px) {
//           .chat-container { width: 90vw !important; height: 90vh !important; max-height: 520px; bottom: 10px !important; right: 5px !important; }
//           .open-chat-button { width: 160px !important; height: 36px !important; font-size: 12px !important; }
//           .close-button { top: -18px !important; left: -15px !important; padding: 6px !important; width: 28px !important; height: 28px !important; }
//           .chat-input { font-size: 12px !important; padding: 8px !important; }
//           .apply-button { font-size: 12px !important; padding: 8px !important; }
//           .vacancy-card { padding: 8px !important; }
//           .vacancy-title { font-size: 11px !important; }
//           .vacancy-price { font-size: 10px !important; }
//           .vacancy-description { font-size: 10px !important; }
//         }
//       `}</style>

//       {/* THEME SCOPE */}
//       <div id="ts-widget-root" style={TOKENS}>
//         {/* Launcher */}
//         <div className="fixed right-4 bottom-0 z-50">
//           {!isOpen && (
//             <button
//               aria-label="Open Chat"
//               onClick={() => setIsOpen(true)}
//               style={btnStyle("primary", false, {
//                 borderRadius: "20px 20px 0 0",
//                 paddingLeft: 16,
//                 paddingRight: 16,
//                 height: 36,
//               })}
//               className="open-chat-button cursor-pointer relative w-[200px] h-9 rounded-t-[20px] border border-transparent flex items-center justify-center text-sm font-medium transition-all duration-300 overflow-hidden"
//               title={t.openChat}
//             >
//               {IS_GLASS && <div className="ts-shimmer" />}
//               <div className="relative flex items-center gap-2 z-10">
//                 <UserRound className="w-4 h-4" />
//                 <span>{t.openChat}</span>
//               </div>
//             </button>
//           )}
//         </div>

//         {/* Chat panel */}
//         {isOpen && (
//           <div
//             className={`fixed right-1 bottom-2 z-50 transition-all duration-300 ease-in-out transform chat-container ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8  h-[500px]"
//               }`}
//             style={{ height: isOpen ? "  top-0" : "top-[-500px] ", overflow: isOpen ? "visible" : "hidden", width: "370px" }}
//           >
//             <button
//               onClick={() => setIsOpen(false)}
//               aria-label="Yopish"
//               className="close-button cursor-pointer text-zinc-500 absolute -left-5 -top-3 z-50 p-1 rounded-full flex items-center justify-center"
//               style={glassy({ width: 24, height: 24, background: IS_GLASS ? "rgba(255,255,255,0.16)" : "#fff" })}
//               title="Yopish"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//               </svg>
//             </button>

//             <div
//               className="w-full rounded-xl overflow-hidden flex flex-col text-sm relative   min-h:[500px] min-h-[500px]"
//               style={glassy({ background: "var(--ts-bg)" })}
//             >
//               {IS_GLASS && <div className="ts-bubbles" />}

//               {/* Header */}
//               <div
//                 className="px-3 py-1 flex items-center justify-between gap-2 relative"
//                 style={glassy({
//                   background: "var(--ts-header-bg)",
//                   color: "var(--ts-header-text)",
//                   borderBottom: IS_GLASS ? "1px solid var(--ts-border)" : "1px solid rgba(2,8,23,0.06)",
//                 })}
//               >
//                 <div className="flex items-center gap-2">
//                   {(selectedVacancy || messages.length > 0) && (
//                     <button
//                       onClick={handleBackClick}
//                       aria-label="Orqaga"
//                       className="cursor-pointer p-1 rounded-md w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-85"
//                       style={glassy({
//                         color: "var(--ts-header-text)",
//                         background: IS_GLASS ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.2)",
//                       })}
//                       title="Orqaga qaytish"
//                     >
//                       <ChevronLeft className="min-w-5 min-h-5" />
//                     </button>
//                   )}
//                   <div className="cursor-pointer" onClick={handleBackClick}>
//                     <h1 className="text-[13px] font-medium" style={{ color: "var(--ts-header-text)" }}>
//                       {config?.siteName ? config?.siteName : "TenzorSoft"}
//                     </h1>
//                     <div className="ml-[2px] text-[10px] opacity-90" style={{ color: "var(--ts-header-text)" }}>
//                       {t.department}
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <a
//                     href="https://jobx.uz"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-[11px]"
//                     style={{ color: "var(--ts-header-text)" }}
//                   >
//                     Jobx uz
//                   </a>
//                 </div>
//               </div>

//               {/* Messages + vacancies */}
//               <div className="flex-1 p-3 overflow-y-auto max-h-[390px] space-y-3 chat-scroll relative">
//                 {messages.map((message) => (
//                   <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
//                     <div
//                       className={`max-w-[75%] p-2 rounded-lg break-words shadow-sm ${message.type === "user" ? "text-right" : ""} ${message.type === "system" ? "text-center text-xs" : ""
//                         }`}
//                       style={bubbleStyle(message.type)}
//                     >
//                       <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
//                     </div>
//                   </div>
//                 ))}

//                 {isTyping && (
//                   <div className="flex justify-start">
//                     <div className="p-2 rounded-lg shadow-sm" style={bubbleStyle("bot")}>
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-2 mt-1 overflow-y-auto max-h-[400px] chat-scroll">
//                   {isLoadingVacancies ? (
//                     <div className="text-center py-6 h-36 flex flex-col items-center justify-center">
//                       <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1" />
//                       <p className="text-gray-600 text-xs">{t.loading}</p>
//                     </div>
//                   ) : vacancies.length === 0 ? (
//                     <div className="text-center py-4">
//                       <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-1" />
//                       <p className="text-gray-500 text-[16px]">{t.noVacancies}</p>
//                     </div>
//                   ) : (
//                     !selectedVacancy &&
//                     messages.length <= 0 &&
//                     vacancies.map((vacancy) => {
//                       const isAlreadyApplied = appliedVacancyIds.includes(vacancy.id);
//                       return (
//                         <div
//                           key={vacancy.id}
//                           className="vacancy-card rounded-md overflow-hidden shadow-sm p-2 transition-all border"
//                           style={glassy({
//                             background: IS_GLASS ? "rgba(255,255,255,0.10)" : "#ffffff",
//                             borderColor: "var(--ts-border)",
//                           })}
//                         >
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1 pr-2">
//                               <h3 className="vacancy-title text-xs font-semibold line-clamp-2">{vacancy.title}</h3>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <div className="vacancy-price flex items-center gap-1 text-[11px] font-medium" style={{ color: solidPrimaryForText }}>
//                                   <span>
//                                     {vacancy.from_price}-{vacancy.to_price} {vacancy.valyuta}
//                                   </span>
//                                 </div>
//                                 {isAlreadyApplied && (
//                                   <span
//                                     className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium"
//                                     style={glassy({
//                                       color: IS_GLASS ? "#F8FAFC" : solidPrimaryForText,
//                                       background: IS_GLASS ? "rgba(255,255,255,0.14)" : "rgba(59,130,246,0.12)",
//                                     })}
//                                   >
//                                     {t.applied}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="vacancy-description text-[11px] text-gray-600 mt-1 line-clamp-2">
//                                 {truncateText(vacancy.description, 60)}
//                               </p>
//                             </div>
//                             <div className="flex flex-col items-end gap-1">
//                               <button
//                                 onClick={() => handleApply(vacancy)}
//                                 disabled={isAlreadyApplied}
//                                 className="px-2 py-1 cursor-pointer text-[11px] rounded-md transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                                 style={btnStyle("primary", isAlreadyApplied, { minWidth: 96 })}
//                               >
//                                 {isAlreadyApplied ? t.applied : t.apply}
//                               </button>
//                               <button onClick={() => toggleCardExpansion(vacancy.id)} className="p-1 text-gray-400 cursor-pointer " aria-label="expand">
//                                 {expandedCard === vacancy.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                               </button>
//                             </div>
//                           </div>
//                           {expandedCard === vacancy.id && (
//                             <div className="mt-2 border-t pt-2 text-[12px] text-gray-600" style={{ borderColor: "var(--ts-border)" }}>
//                               <p className="mb-2">{vacancy.description}</p>
//                               <div className="flex justify-end">
//                                 <button
//                                   onClick={() => handleApply(vacancy)}
//                                   disabled={isAlreadyApplied}
//                                   className="px-3 py-1 rounded-md text-[12px] transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                                   style={btnStyle("primary", isAlreadyApplied)}
//                                 >
//                                   {!isAlreadyApplied && <Send className="w-3 h-3 inline-block mr-1" />}
//                                   {isAlreadyApplied ? t.applied : t.apply}
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>

//                 {selectedVacancy && (
//                   <div className="flex justify-start">
//                     <div
//                       className="max-w-[85%] p-2 rounded-md text-xs"
//                       style={glassy({
//                         background: IS_GLASS ? "rgba(255,255,255,0.14)" : "#ffffff",
//                         border: "1px solid var(--ts-border)",
//                       })}
//                     >
//                       <div className="flex gap-2">
//                         <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={onFileChange} />
//                         <button
//                           onClick={triggerFileInput}
//                           disabled={isSubmitting}
//                           className="flex-1 py-1 px-2 text-[12px] cursor-pointer w-[115px] rounded-md transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                           style={btnStyle("primary", isSubmitting)}
//                         >
//                           {t.uploadResume}
//                         </button>
//                         <button
//                           onClick={handleCreateResume}
//                           disabled={isSubmitting}
//                           className="flex-1 py-1 px-2 text-[12px] cursor-pointer w-[115px] rounded-md transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                           style={btnStyle("secondary", isSubmitting)}
//                         >
//                           {t.createResume}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {downloadFileName && (
//                   <div className="flex justify-start">
//                     <div className="max-w-[75%] p-2 rounded-lg text-xs shadow-sm" style={bubbleStyle("bot")}>
//                       <div className="flex items-center justify-between gap-2">
//                         <div>
//                           <p className="font-medium text-xs">{t.fileReady}</p>
//                           <p className="text-[11px] break-all">{downloadFileName}</p>
//                         </div>
//                         <button
//                           onClick={() => downloadFile(downloadFileName)}
//                           className="py-1 px-2 rounded text-[12px] cursor-pointer transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                           style={btnStyle("primary")}
//                         >
//                           {t.download}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Footer / input */}
//               <div className="flex flex-row items-center justify-center gap-2 h-7 py-2">
//                 <a href="https://jobx.uz" target="_blank" rel="noopener noreferrer">
//                   <p className="text-zinc-400 cursor-pointer">TenzorSoft tomonidan yaratilgan</p>
//                 </a>
//                 <a href="https://jobx.uz" target="_blank" rel="noopener noreferrer">
//                   <h1 className="cursor-pointer text-lg font-bold text-zinc-400 leading-tight">
//                     JOB
//                     <span
//                       className="inline-block text-2xl bg-gradient-to-r from-gray-500 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse"
//                       style={{ transform: "rotateY(-25deg) skewY(-10deg)" }}
//                     >
//                       X
//                     </span>
//                   </h1>
//                 </a>
//               </div>

//               {!selectedVacancy && messages.length > 0 && !isFinished && (
//                 <div className="border-t p-3" style={{ borderColor: "var(--ts-border)" }}>
//                   <div className="flex gap-2 items-center">
//                     <input
//                       ref={chatInputRef}
//                       type="text"
//                       value={inputMessage}
//                       onChange={(e) => setInputMessage(e.target.value)}
//                       onKeyPress={handleKeyPress}
//                       placeholder={t.placeholder}
//                       onFocus={() => setIsInputFocused(true)}
//                       onBlur={() => setIsInputFocused(false)}
//                       aria-label="Chat input"
//                       className="chat-input flex-1 rounded-full px-3 py-2 text-[13px] outline-none transition-all"
//                       style={glassy({
//                         background: "var(--ts-input-bg)",
//                         border: `1px solid ${isInputFocused
//                           ? IS_GLASS
//                             ? "rgba(255,255,255,0.45)"
//                             : "#BFDBFE"
//                           : "var(--ts-input-border)"
//                           }`,
//                         boxShadow: isInputFocused
//                           ? IS_GLASS
//                             ? "0 0 0 3px rgba(99,102,241,.18)"
//                             : "0 0 0 3px rgba(191,219,254,.6)"
//                           : undefined,
//                       })}
//                     />
//                     <button
//                       onClick={sendMessage}
//                       disabled={isSendDisabled}
//                       className="apply-button  cursor-pointer px-3 py-2 rounded-full text:[13px] text-[13px] transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                       style={btnStyle("primary", isSendDisabled, { borderRadius: 9999 })}

//                     >
//                       {/* {t.apply} */}
//                       <SendHorizonal className="" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//               {!selectedVacancy && messages.length > 0 && isFinished && (
//                 <div className="border-t p-3" style={{ borderColor: "var(--ts-border)" }}>
//                   <button
//                     onClick={handleBackClick}
//                     className="w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none focus:ring-0 hover:translate-y-[-1px]"
//                     style={btnStyle("secondary")}
//                   >
//                     {t.contactSoon}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };
// // sendApplicationToAPI localStorage
// export default IntegratedChatVacancySmall;
// ===================== Always send vacancy ID (from activeVacancyId / session) =====================
// TenzorSoft

import {
	ChevronDown,
	ChevronLeft,
	ChevronUp,
	Inbox,
	RefreshCw,
	SendHorizonal,
	Share2,
	Check,
	UserRound,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWidgetConfig } from "../contexts/widgetContextCore";
import { apiService } from "../services/api";
import WidgetIcon from "../assets/icons/Widget.icon";
import { isHTML, normalizeText, stripHtml } from "../lib/isHTML";

interface WidgetConfig {
	vacancyId?: string;
	vacancyTitle?: string;
	openWidget?: string;
	publicKey?: string;
	sourceOrigin?: string;
	siteName?: string;
	theme?: string;
	btnColor?: string;
	btnTextColor?: string;
	headerBg?: string;
	headerText?: string;
	messageBg?: string;
	messageText?: string;
	chatBg?: string;
	userMessageBg?: string;
	userMessageText?: string;
}

interface Message {
	id: number;
	type: "user" | "bot" | "system";
	content: string;
	timestamp: Date;
	yes_or_no?: boolean;
}

interface Vacancy {
	id: number;
	title: string;
	description?: string;
	price?: string;
	valyuta?: string;
	from_price?: number | null;
	to_price?: number | null;
	required?: string;
	company_name?: string;
	company_logo?: string;
	location?: string;
	site_name?: string;
	type?: string;
}

interface APIResponse {
	answer?: string;
	output?: string;
	message?: string;
	next?: boolean;
	vakansiya?: string;
	vakansiya_type?: string;
	file_name?: string;
	finished?: boolean | null;
	yes_or_no?: boolean;
	test_invite_url: string | null;
	test_invite_token: string | null;
	is_resume_finished?: boolean;
	video_session_ready?: boolean;
}

interface UploadResponse {
	status: string;
	url: string;
	file_name: string;
	detail?: string;
	is_resume_finished?: boolean;
}

interface Translation {
	department: string;
	openChat: string;
	placeholder: string;
	loading: string;
	noVacancies: string;
	apply: string;
	uploadResume: string;
	createResume: string;
	fileReady: string;
	download: string;
	errorUpload: string;
	errorDownload: string;
	errorApplication: string;
	selectVacancy: string;
	onlyPDF: string;
	vacancySelected: string;
	resumeUploaded: string;
	alreadyApplied: string;
	applied: string;
	contactSoon: string;
	companyChatWelcome: string;
	continueToChat: string;
}

interface SiteWidgetField {
	theme: string;
	chatBg: string;
	height: string;
	iconUrl: string;
	btnColor: string;
	headerBg: string;
	position: "right" | "left";
	siteName: string;
	messageBg: string;
	publicKey: string;
	headerText: string;
	widgetType: "list" | "icon";
	messageText: string;
	btnTextColor: string;
	userMessageBg: string;
	userMessageText: string;
	sticked: boolean;
}

export interface Site {
	id: number;
	site_name: string;
	public_key: string;
	site_logo: string | null;
	site_widget_fields: SiteWidgetField[];
	is_active: boolean;
	domain: string;
	domain_id: number;
}

type WidgetStyleOverrides = {
	theme?: string;
	position?: "left" | "right";
	height?: string;

	siteName?: string;
	iconUrl?: string;
	widgetType?: "icon" | "list";
	chatBg?: string;
	btnColor?: string;
	btnTextColor?: string;
	headerBg?: string;
	headerText?: string;

	messageBg?: string;
	messageText?: string;

	userMessageBg?: string;
	userMessageText?: string;
	publicKey?: string;
	sticked?: boolean;
};

type TokenCSSVar =
	| "--ts-bg"
	| "--ts-border"
	| "--ts-header-bg"
	| "--ts-header-text"
	| "--ts-primary"
	| "--ts-on-primary"
	| "--ts-primary-weak"
	| "--ts-on-primary-weak"
	| "--ts-user-bubble"
	| "--ts-on-user-bubble"
	| "--ts-bot-bubble"
	| "--ts-on-bot-bubble"
	| "--ts-system-bubble"
	| "--ts-on-system-bubble"
	| "--ts-input-bg"
	| "--ts-input-border";

type TokenStyles = React.CSSProperties & Record<TokenCSSVar, string>;

interface JobWidgetProps {
	config?: WidgetConfig;
	accessToken?: string;
}

export type ChatMessageType = "user" | "bot" | "system";

export interface ChatMessage {
	id: number;
	type: ChatMessageType;
	content: string;
}

const IntegratedChatVacancy: React.FC<JobWidgetProps> = ({ accessToken }) => {
	const { config } = useWidgetConfig();
	const [language] = useState<string>("uz");
	const [backendOverrides, setBackendOverrides] =
		useState<WidgetStyleOverrides>({});

	const t: Translation = {
		department: "Kadrlar bo'limi",
		openChat: "Bo'sh ish o'rinlari",
		placeholder: "Savol yozing...",
		loading: "Yuklanmoqda...",
		noVacancies: "Hozirda vakansiya mavjud emas",
		apply: "Ariza Topshirish",
		uploadResume: "Rezyume yuklash",
		createResume: "Rezyume yaratish",
		fileReady: "Fayl tayyor",
		download: "Yuklab olish",
		errorUpload: "Fayl yuklashda xatolik",
		errorDownload: "Faylni yuklab olishda xatolik yuz berdi",
		errorApplication: "Ariza yuborishda xatolik yuz berdi",
		selectVacancy: "Vakansiya tanlanmagan",
		onlyPDF: "Faqat PDF fayllarni yuklashingiz mumkin",
		vacancySelected: 'Siz "{title}" vakansiyasiga topshiryapsiz',
		resumeUploaded: "Rezyume yuklandi",
		alreadyApplied: 'Siz avval "{title}" vakansiyasiga ariza topshirgansiz.',
		applied: "Topshirildi",
		contactSoon: "Siz bilan tez orada bog'lanamiz",
		companyChatWelcome:
			"Salom! Kompaniya, ish sharoitlari, madaniyat yoki umumiy ma’lumotlar haqida savol berishingiz mumkin. Davom etirish uchun tilni tanlang!",
		continueToChat: "Chatga o'tish",
	};

	const themeName = (config?.theme ?? "").toLowerCase().trim();
	const IS_GLASS = themeName === "glassmorphism";

	const defaultTokensBase: TokenStyles = {
		"--ts-bg": "transparent",
		"--ts-border": "#E6E6EB",
		"--ts-header-bg": "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
		"--ts-header-text": "#ffffff",
		"--ts-primary": "#2563eb",
		"--ts-on-primary": "#ffffff",
		"--ts-primary-weak": "#3b82f6",
		"--ts-on-primary-weak": "#ffffff",
		"--ts-user-bubble": "#eef2f7",
		"--ts-on-user-bubble": "#0f172a",
		"--ts-bot-bubble": "#3b82f6",
		"--ts-on-bot-bubble": "#ffffff",
		"--ts-system-bubble": "#f5f7fb",
		"--ts-on-system-bubble": "#475569",
		"--ts-input-bg": "#ffffff",
		"--ts-input-border": "#E6E6EB",
	};

	const glassTokensBase: TokenStyles = {
		"--ts-bg": "transparent",
		"--ts-border": "rgba(255,255,255,0.22)",
		"--ts-header-bg":
			"linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(59,130,246,0.45) 100%)",
		"--ts-header-text": "#E8F0FF",
		"--ts-primary": "rgba(59,130,246,0.42)",
		"--ts-on-primary": "#F8FAFC",
		"--ts-primary-weak": "rgba(148,163,184,0.35)",
		"--ts-on-primary-weak": "#F8FAFC",
		"--ts-user-bubble": "rgba(148,163,184,0.32)",
		"--ts-on-user-bubble": "#F8FAFC",
		"--ts-bot-bubble": "rgba(59,130,246,0.38)",
		"--ts-on-bot-bubble": "#F8FAFC",
		"--ts-system-bubble": "rgba(15,23,42,0.42)",
		"--ts-on-system-bubble": "#E2E8F0",
		"--ts-input-bg": "rgba(255,255,255,0.12)",
		"--ts-input-border": "rgba(255,255,255,0.28)",
	};

	const overridesRaw = {
		btnColor: backendOverrides.btnColor ?? config?.btnColor,
		btnTextColor: backendOverrides.btnTextColor ?? config?.btnTextColor,
		headerBg: backendOverrides.headerBg ?? config?.headerBg,
		headerText: backendOverrides.headerText ?? config?.headerText,
		messageBg: backendOverrides.messageBg ?? config?.messageBg,
		messageText: backendOverrides.messageText ?? config?.messageText,
		chatBg: backendOverrides.chatBg ?? config?.chatBg,
		userMessageBg: backendOverrides.userMessageBg ?? config?.userMessageBg,
		userMessageText:
			backendOverrides.userMessageText ?? config?.userMessageText,
	};
	const overrides = Object.fromEntries(
		Object.entries(overridesRaw).filter(([, v]) => v != null),
	);
	const hasOverrides = Object.keys(overrides).length > 0;

	const base = IS_GLASS ? glassTokensBase : defaultTokensBase;

	const tokensFromOverrides: Partial<TokenStyles> = {};
	if (overrides.btnColor)
		tokensFromOverrides["--ts-primary"] = overrides.btnColor as string;
	if (overrides.btnTextColor)
		tokensFromOverrides["--ts-on-primary"] = overrides.btnTextColor as string;
	if (overrides.headerBg)
		tokensFromOverrides["--ts-header-bg"] = overrides.headerBg as string;
	if (overrides.headerText)
		tokensFromOverrides["--ts-header-text"] = overrides.headerText as string;
	if (overrides.messageBg) {
		tokensFromOverrides["--ts-bot-bubble"] = overrides.messageBg as string;
		tokensFromOverrides["--ts-primary-weak"] = overrides.messageBg as string;
	}
	if (overrides.messageText) {
		tokensFromOverrides["--ts-on-bot-bubble"] = overrides.messageText as string;
		tokensFromOverrides["--ts-on-primary-weak"] =
			overrides.messageText as string;
	}
	if (overrides.userMessageBg)
		tokensFromOverrides["--ts-user-bubble"] = overrides.userMessageBg as string;
	if (overrides.userMessageText)
		tokensFromOverrides["--ts-on-user-bubble"] =
			overrides.userMessageText as string;
	if (overrides.chatBg)
		tokensFromOverrides["--ts-bg"] = overrides.chatBg as string;

	const TOKENS: TokenStyles = useMemo(
		() => ({ ...base, ...(hasOverrides ? tokensFromOverrides : {}) }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[IS_GLASS, hasOverrides, JSON.stringify(tokensFromOverrides)],
	);

	const glassy = (extra?: React.CSSProperties): React.CSSProperties =>
		IS_GLASS
			? {
					backdropFilter: "blur(22px)",
					WebkitBackdropFilter: "blur(22px)",
					border: "1px solid var(--ts-border)",
					...extra,
				}
			: { ...extra };

	const btnStyle = (
		variant: "primary" | "secondary",
		disabled?: boolean,
		extra?: React.CSSProperties,
	): React.CSSProperties => {
		if (disabled) {
			return glassy({
				background: IS_GLASS ? "rgba(148,163,184,0.28)" : "rgba(2,8,23,0.08)",
				color: IS_GLASS ? "rgba(241,245,249,0.7)" : "rgba(2,6,23,0.55)",
				cursor: "not-allowed",
				boxShadow: "none",
				...extra,
			});
		}
		const baseStyles =
			variant === "primary"
				? { background: "var(--ts-primary)", color: "var(--ts-on-primary)" }
				: {
						background: "var(--ts-primary-weak)",
						color: "var(--ts-on-primary-weak)",
					};
		return {
			...baseStyles,
			transition: "transform .15s ease, opacity .15s ease",
			...extra,
		};
	};

	const bubbleStyle = (who: Message["type"]): React.CSSProperties => {
		if (who === "user")
			return glassy({
				background: "var(--ts-user-bubble)",
				color: "var(--ts-on-user-bubble)",
				borderRadius: "16px 16px 4px 16px",
			});
		if (who === "bot")
			return glassy({
				background: "var(--ts-bot-bubble)",
				color: "var(--ts-on-bot-bubble)",
				borderRadius: "16px 16px 16px 4px",
			});
		return glassy({
			background: "var(--ts-system-bubble)",
			color: "var(--ts-on-system-bubble)",
			borderRadius: "12px",
		});
	};

	const primaryIsGradient = String(TOKENS["--ts-primary"])
		.toLowerCase()
		.includes("gradient");
	const solidPrimaryForText = primaryIsGradient
		? (TOKENS["--ts-on-primary"] as string)
		: (TOKENS["--ts-primary"] as string);
	const vacancyId = config?.vacancyId;
	const vacancyTitle = config?.vacancyTitle ?? config?.title;
	const openWidget =
		config?.openWidget ?? (config?.autoOpen ? "true" : undefined);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState<string>("");
	const [sessionId] = useState<string>(
		() =>
			"session_" +
			Math.random().toString(36).slice(2) +
			Math.random().toString(36).slice(2),
	);
	const [isTyping, setIsTyping] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [vacancies, setVacancies] = useState<Vacancy[]>([]);
	const [isLoadingVacancies, setIsLoadingVacancies] = useState<boolean>(true);
	const [expandedCard, setExpandedCard] = useState<number | null>(null);
	const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(
		vacancyId ? { id: Number(vacancyId), title: String(vacancyTitle) } : null,
	);
	const [uploadedResume, setUploadedResume] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
	const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(
		config?.openWidget === "true" ||
			config?.autoOpen === true ||
			(typeof config?.openWidget === "boolean" && config.openWidget),
	);
	const [appliedVacancyIds, setAppliedVacancyIds] = useState<number[]>([]);
	const [isFinished, setIsFinished] = useState<boolean>(false);
	const [activeVacancyId, setActiveVacancyId] = useState<number | null>(null);
	// const [isUploading, setIsUploading] = useState(false);
	// const [isCreating, setIsCreating] = useState(false);
	const [languageWidget, setLanguageWidget] = useState<
		"uz" | "en" | "ru" | null
	>(null);
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [inviteToken, setInviteToken] = useState<string | null>(null);
	const [generatedLink, setGeneratedLink] = useState<string | null>(null);
	const [companyChatOpen, setCompanyChatOpen] = useState(false);
	const [companyMessages, setCompanyMessages] = useState<ChatMessage[]>([]);
	const [companyInput, setCompanyInput] = useState("");
	const [companyIsTyping, setCompanyIsTyping] = useState(false);
	const [copiedVacancyId, setCopiedVacancyId] = useState<number | null>(null);
	const [isResumeFinished, setIsResumeFinished] = useState(false);
	const [vacancyType, setVacancyType] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const chatInputRef = useRef<HTMLTextAreaElement>(null);

	const publicKey =
		config?.publicKey ?? config?.public_key ?? "JhwH4LrDLnVgQ3GC";
	const siteDomain =
		config?.sourceOrigin ?? config?.sourceUrl ?? "https://tenzorsoft.com";
	const chatApiUrl = `https://ai.tenzorsoft.uz/chat?public_key=${publicKey}&site_domain=${encodeURIComponent(
		siteDomain,
	)}`;
	const companyChatApiUrl = `https://ai.tenzorsoft.uz/company_chat?public_key=${publicKey}&site_domain=${encodeURIComponent(
		siteDomain,
	)}`;
	const uploadApiUrl = "https://ai.tenzorsoft.uz/upload";
	const internalDomains = ["jobx.uz", "my.jobx.uz", "localhost:5173"];
	const isInternalSource = internalDomains.some(domain =>
		config?.sourceOrigin?.includes(domain),
	);
	const vacancyApiUrl =
		isInternalSource || (!config?.sourceOrigin && !config?.sourceUrl)
			? `https://ai.tenzorsoft.uz/all_vakansiya`
			: `https://ai.tenzorsoft.uz/show_vakansiya?public_key=${publicKey}&site_domain=${encodeURIComponent(
					siteDomain,
				)}`;

	const downloadBaseUrl = "https://ai.tenzorsoft.uz/download/";
	const scrollToBottom = () =>
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

	useEffect(() => {
		if (languageWidget && selectedVacancy && messages.length === 0) {
			setMessages([
				{
					id: Date.now(),
					type: "system",
					content: t.vacancySelected.replace("{title}", selectedVacancy.title),
					timestamp: new Date(),
				},
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [languageWidget, selectedVacancy, messages.length]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, selectedVacancy, downloadFileName]);

	const getSiteKey = () => config?.publicKey ?? "JhwH4LrDLnVgQ3GC";
	const getUsername = () => config?.sourceOrigin ?? "https://tenzorsoft.com";
	const defaultQueryNames = { public_key: "public_key", username: "username" };

	const greetings = {
		en: "Hi ! Welcome to our company chat. Feel free to ask me anything about our company, services, or job openings. How can I help you today?",
		ru: "Привет ! Добро пожаловать в чат нашей компании. Не стесняйтесь задавать вопросы о нашей компании, услугах или вакансиях. Чем я могу помочь?",
		uz: "Salom ! Kompaniya chatimizga xush kelibsiz. Kompaniya, xizmatlar yoki bo‘sh ish o‘rinlari haqida savollar berishingiz mumkin. Qanday yordam bera olaman?",
	};

	const buildUrlWithAuth = (
		base: string,
		extraParams: Record<string, string> = {},
		queryNames: Record<string, string> = defaultQueryNames,
	) => {
		const params: Record<string, string> = {
			[queryNames.public_key]: getSiteKey(),
			[queryNames.username]: getUsername(),
			language,
			...extraParams,
		};
		const q = Object.entries(params)
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join("&");
		return base.includes("?") ? `${base}&${q}` : `${base}?${q}`;
	};

	// const appendAuthToForm = (formData: FormData, queryNames: Record<string, string> = defaultQueryNames) => {
	//   formData.append(queryNames.public_key, getSiteKey());
	//   formData.append(queryNames.username, getUsername());
	//   formData.append("language", language);
	// };
	useEffect(() => {
		loadVacancies();
	}, []);

	useEffect(() => {
		apiService
			.getSite(publicKey, siteDomain)
			.then(sites => {
				const fields = sites?.site_widget_fields?.[0];
				if (!fields) return;
				setBackendOverrides({
					btnColor: fields.btnColor,
					btnTextColor: fields.btnTextColor,
					headerBg: fields.headerBg,
					headerText: fields.headerText,
					messageBg: fields.messageBg,
					messageText: fields.messageText,
					chatBg: fields.chatBg,
					userMessageBg: fields.userMessageBg,
					userMessageText: fields.userMessageText,
					position: fields.position,
					widgetType: fields.widgetType,
					sticked: fields.sticked,
				});
			})
			.catch(console.error);
	}, [siteDomain, publicKey, siteDomain]);
	const loadVacancies = async () => {
		setIsLoadingVacancies(true);
		try {
			const url = buildUrlWithAuth(
				vacancyApiUrl,
				{},
				{ public_key: "public_key", username: "site_domain" },
			);
			const response = await fetch(url, {
				method: "GET",
				headers: {
					accept: "application/json",
					...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
				},
			});
			if (response.ok) {
				const res = await response.json();
				let data;
				if (!res.data) {
					data = res;
				} else {
					data = res.data;
				}
				console.log(data);
				console.log("Chat uchun data", data);
				const formatted: Vacancy[] = (Array.isArray(data) ? data : []).map(
					(item: any) => {
						let from_price: number | null = null;
						let to_price: number | null = null;
						let price = "";

						if (item.salary) {
							const salary = item.salary.trim();
							if (salary.includes("-")) {
								const [from, to] = salary
									.split("-")
									.map((s: string) => parseFloat(s.trim()));
								from_price = !isNaN(from) ? from : null;
								to_price = !isNaN(to) ? to : null;
							} else {
								const single = parseFloat(salary);
								from_price = !isNaN(single) ? single : null;
								to_price = null;
							}
							price = item.salary;
						}

						return {
							id: item.id ?? item.vakansiya_id ?? 0,
							title: item.title ?? item.vakansiya_title ?? "Nom berilmagan",
							description: item.description ?? "",
							price,
							valyuta: item.valyuta || "$",
							from_price,
							to_price,
							required: item.required ?? "",
							company_name: item.company_name ?? "",
							company_logo: item.company_logo ?? "",
							location: item.location ?? "",
							site_name: item.site_name ?? "",
						};
					},
				);

				setVacancies(formatted);
			} else {
				setVacancies([]);
			}
		} catch {
			setVacancies([]);
		} finally {
			setIsLoadingVacancies(false);
		}
	};
	const addMessage = (text: string, sender: "user" | "bot" | "system") => {
		setMessages(prev => [
			...prev,
			{
				id: Date.now() + Math.floor(Math.random() * 1000),
				type: sender,
				content: text,
				timestamp: new Date(),
			},
		]);
	};

	const animateTyping = async (text: string) =>
		new Promise<void>(resolve => {
			// setIsTyping(true);
			let currentText = "",
				i = 0;
			const int = setInterval(() => {
				if (i < text.length) {
					const step =
						Math.floor(Math.random() * Math.min(4, text.length - i)) + 1;
					currentText += text.slice(i, i + step);
					i += step;
					setMessages(prev => {
						const arr = [...prev];
						if (arr[arr.length - 1]?.type === "bot")
							arr[arr.length - 1].content = currentText;
						return arr;
					});
				} else {
					clearInterval(int);
					setIsTyping(false);
					resolve();
				}
			}, 40);
		});

	const buildJsonHeaders = (): Record<string, string> => {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
		return headers;
	};
	const buildHeadersForForm = (): Record<string, string> =>
		accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

	const resolveVacancyId = (): number | null =>
		activeVacancyId ?? selectedVacancy?.id ?? null;

	const sendMessage = async (overrideMessage?: string) => {
		const messageText = (overrideMessage ?? inputMessage).trim();
		if (!messageText || isLoading) return;

		// Reset textarea height
		if (chatInputRef.current) {
			chatInputRef.current.style.height = "40px";
		}

		const vid = resolveVacancyId();
		if (vid == null) {
			addMessage(t.selectVacancy, "system");
			return;
		}

		if (!overrideMessage) addMessage(messageText, "user");

		setInputMessage("");
		setIsLoading(true);

		setIsTyping(true);

		addMessage("", "bot");

		try {
			// Check if the message contains selected_test_type
			const testTypeMatch = messageText.match(
				/selected_test_type[:=]\s*(\w+)/i,
			);
			const selectedTestType = testTypeMatch
				? testTypeMatch[1].toLowerCase()
				: null;

			const response = await fetch(chatApiUrl, {
				method: "POST",
				headers: buildJsonHeaders(),
				body: JSON.stringify({
					message: messageText,
					session_id: sessionId,
					resume: uploadedResume,
					public_key: getSiteKey(),
					language: languageWidget,
					vakansiya_id: vid,
					...(selectedTestType && { selected_test_type: selectedTestType }),
				}),
			});

			if (!response.ok) throw new Error(t.errorApplication);

			const data: APIResponse = await response.json();
			const text = data.answer || data.output || t.errorApplication;
			setInviteUrl(data.test_invite_url);
			setInviteToken(data.test_invite_token);

			setMessages(prev => {
				const arr = [...prev];
				const last = arr[arr.length - 1];
				if (last && last.type === "bot") {
					last.yes_or_no = data.yes_or_no === true;
				}
				return arr;
			});
			if (data.video_session_ready) {
				window.open(
					"https://my.jobx.uz/video-assessment?token=" + data.test_invite_token,
					"_blank",
					"noopener,noreferrer",
				);
				//  window.location.href = "https://my.jobx.uz/video-assessment?token=" + data.test_invite_token;
			}
			console.log("data: ", data);
			if (data.is_resume_finished === true) {
				setIsResumeFinished(true);
				// Show the button or perform any other action needed
				// when resume processing is finished
			}
			if (data.finished === true) {
				setIsFinished(true);
				if (selectedVacancy?.id)
					setAppliedVacancyIds(p =>
						p.includes(selectedVacancy.id) ? p : [...p, selectedVacancy.id],
					);
				else if (vid)
					setAppliedVacancyIds(p => (p.includes(vid) ? p : [...p, vid]));
			}

			if (data.file_name) {
				if (text) await animateTyping(text);
				setDownloadFileName(data.file_name);
				addMessage(`${t.fileReady}: ${data.file_name}`, "system");
			} else {
				setIsTyping(false);
				await animateTyping(text);
			}
		} catch (err) {
			setIsTyping(false);
			await animateTyping(t.errorApplication);
		} finally {
			setIsTyping(false);
			setIsLoading(false);
		}
	};

	const handleLanguageSelect = (lang: "en" | "uz" | "ru") => {
		setLanguageWidget(lang);

		const greetingMessage: ChatMessage = {
			id: Date.now(),
			type: "bot",
			content: greetings[lang as "en" | "uz" | "ru"],
		};

		setCompanyMessages(prev => [...prev, greetingMessage]);
		sendCompanyMessage();
	};

	const sendCompanyMessage = async () => {
		if (!companyInput.trim()) return;

		const userMessage: ChatMessage = {
			id: Date.now(),
			type: "user",
			content: companyInput,
		};
		setCompanyMessages(prev => [...prev, userMessage]);
		setCompanyInput("");
		setCompanyIsTyping(true);

		try {
			const response = await fetch(companyChatApiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userMessage.content,
					public_key: publicKey,
					site_domain: siteDomain,
					language: languageWidget || "uz",
				}),
			});

			const data = await response.json();

			const botMessage: ChatMessage = {
				id: Date.now() + 1,
				type: "bot",
				content: data?.message || data?.answer || "No response",
			};

			setCompanyMessages(prev => [...prev, botMessage]);
		} catch (error) {
			console.error("Company chat error:", error);

			setCompanyMessages(prev => [
				...prev,
				{
					id: Date.now() + 2,
					type: "bot",
					content: "Something went wrong. Please try again.",
				},
			]);
		} finally {
			setCompanyIsTyping(false);
		}
	};

	// const handleOpenCompanyChat = () => {
	//   setCompanyChatOpen(true);
	//   setSelectedVacancy(null);
	//   setMessages([]);
	// };

	const toggleCardExpansion = (id: number) =>
		setExpandedCard(expandedCard === id ? null : id);

	const handleApply = (vacancy: Vacancy) => {
		if (appliedVacancyIds.includes(vacancy.id)) {
			addMessage(t.alreadyApplied.replace("{title}", vacancy.title), "system");
			return;
		}

		setSelectedVacancy(vacancy);
		setActiveVacancyId(vacancy.id);
		setMessages([
			{
				id: Date.now(),
				type: "system",
				content: t.vacancySelected.replace("{title}", vacancy.title),
				timestamp: new Date(),
			},
		]);
	};

	const handleBackClick = () => {
		setSelectedVacancy(null);
		setActiveVacancyId(null);
		setMessages([]);
		setUploadedResume("");
		setDownloadFileName(null);
		setIsFinished(false);
		setCompanyChatOpen(false);
		// setIsOpen(false);
		setCompanyMessages([]);
		// Hide video button by resetting resume finished state
		setIsResumeFinished(false);
	};

	const uploadFile = async (file?: File) => {
		const pickedFile = file || fileInputRef.current?.files?.[0];
		if (!pickedFile) return;
		if (pickedFile.type !== "application/pdf") {
			addMessage(t.onlyPDF, "system");
			return;
		}
		const vid = resolveVacancyId();
		if (vid == null) {
			addMessage(t.selectVacancy, "system");
			return;
		}

		const formData = new FormData();
		formData.append("file", pickedFile);
		formData.append("session_id", sessionId);
		formData.append("vakansiya_id", String(vid));
		formData.append("public_key", getSiteKey());
		formData.append("site_domain", getUsername());
		formData.append("language", language);

		try {
			// setIsUploading(true);
			setIsSubmitting(true);
			const loadingId = Date.now() + Math.floor(Math.random() * 1000);
			setMessages(prev => [
				...prev,
				{
					id: loadingId,
					type: "system",
					content: t.loading,
					timestamp: new Date(),
				},
			]);

			const response = await fetch(uploadApiUrl, {
				method: "POST",
				headers: buildHeadersForForm(),
				body: formData,
			});

			setMessages(prev => prev.filter(m => m.id !== loadingId));

			if (response.ok) {
				const res: UploadResponse = await response.json();
				if (res.status === "success" && res.file_name && res.url) {
					console.log("is_resume_finished:", res.is_resume_finished);
					setUploadedResume(res.file_name);
					addMessage(`${t.resumeUploaded}: ${res.file_name}`, "system");

					// Check if resume processing is finished
					if (res.is_resume_finished) {
						setIsResumeFinished(true);
					} else {
						await sendApplicationToAPI(true, res.file_name);
					}
				} else {
					addMessage(
						`${t.errorUpload}: ${res.detail || "Unknown error"}`,
						"bot",
					);
				}
			} else {
				const err = await response.json().catch(() => ({}));
				addMessage(`${t.errorUpload}: ${err.detail || t.errorUpload}`, "bot");
			}
		} catch {
			addMessage(t.errorUpload, "bot");
		} finally {
			// setIsUploading(false);
			setIsSubmitting(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const sendApplicationToAPI = async (
		hasResume: boolean,
		resumeFilename?: string,
	) => {
		const vid = resolveVacancyId();
		if (vid == null) {
			addMessage(t.selectVacancy, "system");
			return;
		}

		try {
			const msg = hasResume ? t.uploadResume : t.createResume;
			setIsTyping(true);
			addMessage("", "bot");

			const response = await fetch(chatApiUrl, {
				method: "POST",
				headers: buildJsonHeaders(),
				body: JSON.stringify({
					message: msg,
					session_id: sessionId,
					resume: resumeFilename || "",
					public_key: getSiteKey(),
					site_domain: getUsername(),
					language: languageWidget,
					vakansiya_id: vid,
					selected_test_type: "widget",
				}),
			});

			if (response.ok) {
				const data: APIResponse = await response.json();
				setIsTyping(false);
				console.log("data2:", data);
				if (data.is_resume_finished === true) {
					setIsResumeFinished(true);
					// Show the button or perform any other action needed
					// when resume processing is finished
				}
				setVacancyType(data.vakansiya_type || "both");
				const text = data.answer || data.output || t.apply;
				if (data.finished === true) {
					setIsFinished(true);
					if (selectedVacancy?.id)
						setAppliedVacancyIds(p =>
							p.includes(selectedVacancy.id) ? p : [...p, selectedVacancy.id],
						);
					else if (vid)
						setAppliedVacancyIds(p => (p.includes(vid) ? p : [...p, vid]));
				}
				// setSelectedVacancy(null);
				if (data.file_name) {
					if (text) await animateTyping(text);
					setDownloadFileName(data.file_name);
					addMessage(`${t.fileReady}: ${t.fileReady}`, "system");
				} else {
					await animateTyping(text);
				}
			} else {
				await animateTyping(t.errorApplication);
			}
		} catch {
			await animateTyping(t.errorApplication);
		} finally {
			setIsTyping(false);
		}
	};

	const handleCreateResume = async () => {
		const vid = resolveVacancyId();
		if (vid == null) {
			addMessage(t.selectVacancy, "system");
			return;
		}
		// setIsCreating(true);
		setIsSubmitting(true);
		await sendApplicationToAPI(false);
		// setIsCreating(false);
		setIsSubmitting(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			// Reset textarea height before sending message
			if (chatInputRef.current) {
				chatInputRef.current.style.height = "40px";
			}
			if (!isLoading) sendMessage();
		}
	};

	const downloadFile = async (filename: string) => {
		try {
			const url = buildUrlWithAuth(
				`${downloadBaseUrl}${encodeURIComponent(filename)}`,
				{},
				{ public_key: "public_key", username: "site_domain" },
			);
			const res = await fetch(url, {
				method: "GET",
				headers: {
					...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
				},
			});
			if (!res.ok) throw new Error(t.errorDownload);
			const blob = await res.blob();
			const link = document.createElement("a");
			const href = window.URL.createObjectURL(blob);
			link.href = href;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(href);
			setDownloadFileName(null);
		} catch {
			addMessage(t.errorDownload, "bot");
		}
	};

	const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) await uploadFile(file);
	};
	const handleCopyLink = async (vacancyId: number, title: string) => {
		const url = `/?vacancyId=${vacancyId}&title=${title}&openWidget=true`;
		try {
			await navigator.clipboard.writeText(url);
			setCopiedVacancyId(vacancyId);
			setTimeout(() => setCopiedVacancyId(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const triggerFileInput = () => fileInputRef.current?.click();

	useEffect(() => {
		if (!inviteUrl) return;

		const getInterviewData = async () => {
			try {
				const response = await fetch(inviteUrl);
				const data = await response.json();

				if (data) {
					const baseUrl = "https://my.jobx.uz/test/interview";
					const newUrl = new URL(baseUrl);
					newUrl.searchParams.set("testId", data.test.id);
					newUrl.searchParams.set("token", inviteToken || "");
					newUrl.searchParams.set("session_id", data.session_id);
					const finalUrl = newUrl.toString();
					console.log("Generated Interview Link:", finalUrl);

					setGeneratedLink(finalUrl);
				}
			} catch (error) {
				console.error("Failed to generate link:", error);
			}
		};

		getInterviewData();
	}, [inviteUrl, inviteToken]);

	const handleOpen = () => {
		setIsOpen(true);
		try {
			window.parent.postMessage({ type: "CSW_OPEN" }, "*");
		} catch {
			console.log("handleClose");
		}
		setTimeout(() => chatInputRef.current?.focus(), 150);
	};
	const handleClose = () => {
		setIsOpen(false);
		// Hide video button by resetting resume finished state
		setIsResumeFinished(false);
		try {
			window.parent.postMessage({ type: "CSW_CLOSE" }, "*");
		} catch {
			console.log("handleClose");
		}
	};

	useEffect(() => {
		if (isOpen) setTimeout(() => chatInputRef.current?.focus(), 150);
	}, [isOpen]);

	const isSendDisabled = !inputMessage.trim() || isLoading;

	return (
		<>
			<style>{`
        html, body, #root { background: transparent !important; height: 100%; }
        .chat-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .chat-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .open-chat-button:hover { transform: translateY(-1px) scale(1.02); opacity: .98; }
      `}</style>

			<div style={TOKENS}>
				{!isOpen &&
					(!openWidget || openWidget === "false") &&
					backendOverrides &&
					backendOverrides.widgetType &&
					backendOverrides.position && (
						<div
							className={`fixed  z-[2147483647] ${
								backendOverrides.widgetType === "list"
									? backendOverrides.position === "right"
										? "bottom-0 right-0"
										: "bottom-0 left-0"
									: backendOverrides.position === "right"
										? `bottom-5 ${
												backendOverrides.sticked ? "right-0" : "right-5"
											}`
										: `bottom-5 ${backendOverrides.sticked ? "left-0" : "left-5"}`
							}`}
							style={
								backendOverrides.widgetType === "list"
									? { width: 200, height: 36 }
									: { width: 60, height: 60 }
							}
						>
							{backendOverrides.widgetType === "list" ? (
								<button
									aria-label='Open Chat'
									onClick={handleOpen}
									style={btnStyle("primary", false, {
										borderRadius: backendOverrides.sticked
											? "20px 0 0 20px"
											: "20px 20px 0 0",
										paddingLeft: backendOverrides.sticked ? 8 : 16,
										paddingRight: backendOverrides.sticked ? 8 : 16,
										height: backendOverrides.sticked ? 150 : 36,
									})}
									className='open-chat-button w-[200px] cursor-pointer relative  border border-transparent flex items-center justify-center text-sm font-medium transition-all duration-300 overflow-hidden'
									title={t.openChat}
								>
									<div
										className={`relative flex items-center gap-2 z-10   ${
											backendOverrides.sticked ? "vertical-text" : ""
										}`}
									>
										<span
											className={
												backendOverrides.sticked ? "vertical-icon" : ""
											}
										>
											<UserRound className='w-4 h-4' />
										</span>
										<span>{t.openChat}</span>
									</div>
								</button>
							) : (
								<button
									aria-label='Open Chat'
									onClick={handleOpen}
									style={{
										padding: 10,
										background: btnStyle("primary", false).background,
										// color: "#fff",
										border: btnStyle("primary", false).border,
										borderRadius: backendOverrides.sticked
											? "20px 0 0 20px"
											: "50%",
									}}
									className='open-chat-button wave-pulse'
									title={t.openChat}
								>
									<div className='relative flex items-center gap-2 z-10'>
										<WidgetIcon />
									</div>
								</button>
							)}
						</div>
					)}

				{isOpen && (
					<div
						className={`fixed bottom-0 z-50
              transition-all duration-300 ease-in-out transform chat-container
              ${backendOverrides.position === "right" ? "right-0" : "left-0"}
            `}
						style={{ width: "370px", minHeight: "500px" }}
					>
						<button
							onClick={handleClose}
							aria-label='Close'
							className='cursor-pointer text-zinc-500 absolute -left-5 -top-3 z-50 p-1 rounded-full flex items-center justify-center'
							title='Close'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<line x1='18' y1='6' x2='6' y2='18' />
								<line x1='6' y1='6' x2='18' y2='18' />
							</svg>
						</button>

						<div
							className='w-full rounded-xl overflow-hidden flex flex-col text-sm relative min-h-[500px]'
							style={{ background: "var(--ts-bg)" }}
						>
							<div
								className='px-3 py-1 flex items-center justify-between gap-2 relative rounded-xl'
								style={{
									background: "var(--ts-header-bg)",
									color: "var(--ts-header-text)",
									borderBottom: IS_GLASS
										? "1px solid var(--ts-border)"
										: "1px solid rgba(2,8,23,0.06)",
								}}
							>
								<div className='flex items-center gap-2'>
									{(selectedVacancy ||
										messages.length > 0 ||
										companyChatOpen) && (
										<button
											onClick={handleBackClick}
											aria-label='Back'
											className='cursor-pointer p-1 rounded-md w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-85'
											style={{ color: "var(--ts-header-text)" }}
										>
											<ChevronLeft className='min-w-5 min-h-5' />
										</button>
									)}
									<div className='cursor-pointer' onClick={handleBackClick}>
										<h1
											className='text-[13px] font-medium'
											style={{ color: "var(--ts-header-text)" }}
										>
											{config?.siteName || "TenzorSoft"}
										</h1>
										<div
											className='ml-0.5 text-[10px] opacity-90'
											style={{ color: "var(--ts-header-text)" }}
										>
											{t.department}
										</div>
									</div>
								</div>
								<div className='flex gap-2'>
									<div>
										{" "}
										<button
											onClick={handleClose}
											aria-label='Close'
											className='cursor-pointer text-white ml-5 mt-1   rounded-full flex items-center justify-center'
											title='Close'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M18 6 6 18' />
												<path d='m6 6 12 12' />
											</svg>
										</button>
										<a
											href='/'
											target='_blank'
											rel='noopener noreferrer'
											className='underline text-[11px]'
											style={{ color: "var(--ts-header-text)" }}
										>
											Jobx uz
										</a>
									</div>
								</div>
							</div>

							<div
								className={`flex-1 p-3 overflow-y-auto space-y-3 chat-scroll relative
                  ${selectedVacancy ? "max-h-[350px]" : "h-full"}`}
							>
								{!languageWidget && selectedVacancy && (
									<div className='flex flex-col items-start gap-2'>
										<div
											className='p-2 rounded-lg shadow-sm bg-blue-100 text-blue-800'
											style={{ maxWidth: "75%" }}
										>
											Salom! Davom ettirish uchun tilni tanlang.
										</div>
										<div className='flex gap-2 mt-2'>
											<button
												className='px-3 py-1 rounded-md border bg-white text-sm'
												onClick={() => setLanguageWidget("en")}
											>
												EN
											</button>
											<button
												className='px-3 py-1 rounded-md border bg-white text-sm'
												onClick={() => setLanguageWidget("ru")}
											>
												RU
											</button>
											<button
												className='px-3 py-1 rounded-md border bg-white text-sm'
												onClick={() => setLanguageWidget("uz")}
											>
												UZ
											</button>
										</div>
									</div>
								)}

								{languageWidget && selectedVacancy && !companyChatOpen && (
									<>
										{messages.map(message => {
											// Skip empty bot messages when typing
											if (
												isTyping &&
												message.type === "bot" &&
												message.content === ""
											) {
												return null;
											}
											return (
												<div
													key={message.id}
													className={`flex ${
														message.type === "user"
															? "items-end flex-col"
															: "items-end gap-2"
													}`}
												>
													<div className='max-w-[75%]'>
														<div
															className={`w-full p-2 rounded-lg shadow-sm ${
																message.type === "user" ? "text-right" : ""
															} ${
																message.type === "system"
																	? "text-center text-xs mb-[10px]"
																	: ""
															}`}
															style={bubbleStyle(message.type)}
														>
															<p className='text-[12px] leading-relaxed whitespace-pre-wrap'>
																{message.content}
															</p>
															{message.type === "system" &&
																messages.length < 2 && (
																	<div className='flex justify-center'>
																		<div className='p-2 rounded-md text-xs'>
																			<div className='flex gap-2'>
																				<input
																					ref={fileInputRef}
																					type='file'
																					accept='.pdf'
																					className='hidden'
																					onChange={onFileChange}
																				/>
																				<button
																					onClick={triggerFileInput}
																					disabled={isSubmitting}
																					className='flex-1 py-2 px-2 text-[12px] cursor-pointer w-[115px] rounded-md transition-transform focus:outline-none hover:translate-y-[-1px]'
																					style={btnStyle(
																						"primary",
																						isSubmitting,
																					)}
																				>
																					{t.uploadResume}
																				</button>
																				<button
																					onClick={handleCreateResume}
																					disabled={isSubmitting}
																					className='flex-1 py-2 px-2 text-[12px] cursor-pointer w-[115px] rounded-md transition-transform focus:outline-none hover:translate-y-[-1px]'
																					style={btnStyle(
																						"secondary",
																						isSubmitting,
																					)}
																				>
																					{t.createResume}
																				</button>
																			</div>
																		</div>
																	</div>
																)}
														</div>
													</div>
												</div>
											);
										})}

										{/* Loading indicator when bot is typing */}
										{isTyping && (
											<div className='flex items-end gap-2'>
												<div
													className='p-2 rounded-lg shadow-sm'
													style={{
														background: "var(--ts-bot-bubble)",
														color: "var(--ts-on-bot-bubble)",
													}}
												>
													<div className='flex space-x-1'>
														<div
															className='w-2 h-2 bg-current rounded-full animate-bounce'
															style={{ animationDelay: "0ms" }}
														/>
														<div
															className='w-2 h-2 bg-current rounded-full animate-bounce'
															style={{ animationDelay: "150ms" }}
														/>
														<div
															className='w-2 h-2 bg-current rounded-full animate-bounce'
															style={{ animationDelay: "300ms" }}
														/>
													</div>
												</div>
											</div>
										)}
									</>
								)}
								{isResumeFinished && (
									<div
										className='flex max-w-[75%] justify-center p-3 border-t gap-3'
										style={{ borderColor: "var(--ts-border)" }}
									>
										{vacancyType === "video" && (
											<button
												onClick={() => {
													// Send selected_test_type=video to chat
													const message = "selected_test_type=video";
													setInputMessage(message);
													sendMessage(message);
													setIsResumeFinished(false);
												}}
												className=' px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
											>
												Video Chat
											</button>
										)}

										{vacancyType === "widget" && (
											<button
												onClick={() => {
													const message = "selected_test_type:widget";
													setInputMessage(message);
													sendMessage(message);
													setIsResumeFinished(false);
												}}
												className=' px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
											>
												Widget
											</button>
										)}

										{vacancyType === "both" && (
											<>
												<button
													onClick={() => {
														// Send selected_test_type=video to chat
														const message = "selected_test_type=video";
														setInputMessage(message);
														sendMessage(message);
														setIsResumeFinished(false);
													}}
													className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
												>
													Video Chat
												</button>
												<button
													onClick={async () => {
														// Send selected_test_type=widget to chat
														const message = "selected_test_type=widget";
														setInputMessage(message);
														sendMessage(message);
														setIsResumeFinished(false);
													}}
													className=' px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors'
												>
													Widget
												</button>
											</>
										)}
									</div>
								)}
								{companyChatOpen && (
									<>
										<div className='p-3 overflow-y-auto space-y-3 chat-scroll relative h-[340px]'>
											{companyMessages.length === 0 && !languageWidget && (
												<div className='flex flex-col items-start gap-2'>
													<div
														className='p-2 rounded-lg shadow-sm bg-blue-100 text-blue-800'
														style={{ maxWidth: "75%" }}
													>
														{t.companyChatWelcome}
													</div>
													<div className='flex gap-2 mt-2'>
														<button
															className='px-3 py-1 rounded-md border bg-white text-sm'
															onClick={() => handleLanguageSelect("en")}
														>
															EN
														</button>
														<button
															className='px-3 py-1 rounded-md border bg-white text-sm'
															onClick={() => handleLanguageSelect("ru")}
														>
															RU
														</button>
														<button
															className='px-3 py-1 rounded-md border bg-white text-sm'
															onClick={() => handleLanguageSelect("uz")}
														>
															UZ
														</button>
													</div>
												</div>
											)}
											{companyMessages.map(message => (
												<div
													key={message.id}
													className={`flex ${
														message.type === "user"
															? "justify-end flex-col"
															: "justify-end"
													}`}
												>
													<div
														className='max-w-[75%] p-2 rounded-lg shadow-sm'
														style={bubbleStyle(message.type)}
													>
														{/* <p className='text-[12px] whitespace-pre-wrap'>
															{message.content}
														</p> */}
														<p className='text-[12px] whitespace-pre-wrap break-words overflow-wrap-anywhere'>
															{message.content}
														</p>
													</div>
												</div>
											))}

											{companyIsTyping && (
												<div className='flex items-start gap-2'>
													<div
														className='p-2 rounded-lg shadow-sm'
														style={bubbleStyle("bot")}
													>
														<div className='flex space-x-1'>
															<div className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'></div>
															<div
																className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'
																style={{ animationDelay: "0.1s" }}
															></div>
															<div
																className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'
																style={{ animationDelay: "0.2s" }}
															></div>
														</div>
													</div>
												</div>
											)}
										</div>
										<div
											className='border-t pt-3 px-3'
											style={{ borderColor: "var(--ts-border)" }}
										>
											<div className='flex gap-2 items-center'>
												<input
													type='text'
													value={companyInput}
													onChange={e => setCompanyInput(e.target.value)}
													placeholder='Yozing...'
													className='flex-1 rounded-full px-3 py-2 text-[13px] outline-none'
													style={{
														background: "var(--ts-input-bg)",
														border: `1px solid var(--ts-input-border)`,
													}}
													onKeyPress={e =>
														e.key === "Enter" && sendCompanyMessage()
													}
												/>
												<button
													onClick={sendCompanyMessage}
													className='px-3 py-2 rounded-full text-[13px]'
													style={btnStyle("primary")}
												>
													<SendHorizonal className='w-4 h-4' />
												</button>
											</div>
										</div>
									</>
								)}

								{generatedLink && !companyChatOpen && (
									<div className='flex items-start gap-2'>
										<div
											className='max-w-[75%] p-2 rounded-lg shadow-sm bg-blue-100 text-green-800'
											style={{ wordBreak: "break-all" }}
										>
											<p className='text-[12px] leading-relaxed'>
												Interview Link:{" "}
												<a
													href={generatedLink}
													target='_blank'
													rel='noopener noreferrer'
													className='underline text-blue-600'
												>
													{generatedLink}
												</a>
											</p>
										</div>
									</div>
								)}

								{isTyping && companyChatOpen && (
									<div className='flex items-end gap-2'>
										{/* <div className="flex items-center gap-1 mb-[2px] opacity-80 text-[10px]">
                      <AIcon />
                    </div> */}

										<div
											className='p-2 rounded-lg shadow-sm'
											style={bubbleStyle("bot")}
										>
											<div className='flex space-x-1'>
												<div className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'></div>
												<div
													className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'
													style={{ animationDelay: "0.1s" }}
												></div>
												<div
													className='w-2 h-2 bg-gray-300 rounded-full animate-bounce'
													style={{ animationDelay: "0.2s" }}
												></div>
											</div>
										</div>
									</div>
								)}

								<div className='space-y-2 mt-1 overflow-y-auto max-h-[400px] chat-scroll'>
									{/* {!selectedVacancy &&
                    messages.length === 0 &&
                    !companyChatOpen &&
                    config?.siteName &&
                    config?.siteName != "JobX" && (
                      <div
                        className="rounded-md overflow-hidden shadow-sm p-3 mb-2 border bg-white"
                        style={{ borderColor: "var(--ts-border)" }}
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div className="pr-2">
                            <h3 className="text-sm font-semibold leading-tight">
                              {config.siteName}
                            </h3>
                          </div>
                          <div className="flex flex-col items-end gap-2 mt-4">
                            <button
                              onClick={() => handleOpenCompanyChat()}
                              className="px-3 py-1 text-xs rounded-md cursor-pointer"
                              style={btnStyle("primary", false, {
                                minWidth: 90,
                              })}
                            >
                              Companiya haqida ma’lumot
                            </button>
                          </div>
                        </div>
                      </div>
                    )} */}

									{isLoadingVacancies ? (
										<div className='text-center py-6 h-36 flex flex-col items-center justify-center'>
											<RefreshCw className='w-6 h-6 animate-spin mx-auto mb-1' />
											<p className='text-gray-600 text-xs'>{t.loading}</p>
										</div>
									) : vacancies.length === 0 ? (
										<div className='text-center py-4'>
											<Inbox className='w-8 h-8 text-gray-300 mx-auto mb-1' />
											<p className='text-gray-500 text-[16px]'>
												{t.noVacancies}
											</p>
										</div>
									) : (
										!companyChatOpen &&
										!selectedVacancy &&
										messages.length === 0 &&
										vacancies.map(vacancy => {
											const isAlreadyApplied = appliedVacancyIds.includes(
												vacancy.id,
											);
											return (
												<div
													key={vacancy.id}
													className='rounded-md overflow-hidden shadow-sm p-3 transition-all border'
													style={{
														background: IS_GLASS
															? "rgba(255,255,255,0.10)"
															: "#ffffff",
														borderColor: "var(--ts-border)",
													}}
												>
													<div className='flex items-start justify-between'>
														<div className='flex-1 pr-2'>
															<div className='flex items-center gap-2'>
																{/* {vacancy.company_logo && (s
                                  <img
                                    src={vacancy.company_logo}
                                    alt="logo"
                                    className="w-7 h-7 rounded-full object-cover border"
                                  />
                                )} */}

																<div className='flex flex-col'>
																	<h3 className='text-sm font-semibold leading-tight'>
																		{vacancy.title}
																	</h3>

																	{(vacancy.company_name ||
																		vacancy.site_name) && (
																		<span className='text-[11px] text-gray-500 leading-tight'>
																			{vacancy.company_name &&
																			vacancy.company_name.length > 0
																				? `${vacancy.company_name}${
																						vacancy.site_name
																							? `, ${vacancy.site_name}`
																							: ""
																					}`
																				: vacancy.site_name}
																		</span>
																	)}
																</div>
															</div>
															<div
																className='flex items-center gap-2 mt-2 text-xs font-medium'
																style={{ color: solidPrimaryForText }}
															>
																<span className='text-blue-600'>
																	{vacancy.price
																		? `${vacancy.price} ${vacancy.valyuta}`
																		: "N/A"}
																</span>
															</div>
															{vacancy.location && (
																<a
																	href={vacancy.location}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-[11px] text-blue-600 underline mt-1 inline-block'
																>
																	Manzilni ko‘rish
																</a>
															)}
															{/* {expandedCard !== vacancy.id && (
																<p className='truncate w-[200px] text-gray-500 text-[12px]'>
																	{vacancy.description}
																</p>
															)} */}
															{expandedCard === vacancy.id ? null : (
																<p className='truncate w-[200px] text-gray-500 text-[12px]'>
																	{(() => {
																		const normalized =
																			normalizeText(vacancy.description) || "";
																		// Agar HTML bo'lsa, teglarni olib tashlab, oddiy matn qilib ko'rsatamiz
																		return isHTML(normalized)
																			? stripHtml(normalized)
																			: normalized;
																	})()}
																</p>
															)}
														</div>
														<div className='flex flex-col items-end gap-2'>
															<button
																onClick={() => handleApply(vacancy)}
																disabled={isAlreadyApplied}
																className='px-3 py-1 text-xs rounded-md cursor-pointer'
																style={btnStyle("primary", isAlreadyApplied, {
																	minWidth: 90,
																})}
															>
																{isAlreadyApplied ? t.applied : t.apply}
															</button>
															<button
																onClick={() =>
																	handleCopyLink(vacancy.id, vacancy.title)
																}
																className='p-1 text-gray-400 cursor-pointer transition-colors'
																title='Share'
															>
																{copiedVacancyId === vacancy.id ? (
																	<Check className='w-4 h-4 text-green-500' />
																) : (
																	<Share2 className='w-4 h-4' />
																)}
															</button>
															<button
																onClick={() => toggleCardExpansion(vacancy.id)}
																className='p-1 text-gray-400 cursor-pointer'
															>
																{expandedCard === vacancy.id ? (
																	<ChevronUp className='w-4 h-4' />
																) : (
																	<ChevronDown className='w-4 h-4' />
																)}
															</button>
														</div>
													</div>
													{expandedCard === vacancy.id && (
														<div
															className='mt-3 p-3 border rounded-md bg-gray-50 text-[12px] text-gray-700'
															style={{ borderColor: "var(--ts-border)" }}
														>
															<div className='max-h-[180px] overflow-y-auto pr-1 mb-3'>
																{/* <p className='whitespace-pre-wrap leading-relaxed'>
																	{vacancy.description}
																</p>
																<p className='whitespace-pre-wrap leading-relaxed'>
																	{vacancy.description}
																</p> */}
																<p className='whitespace-pre-wrap leading-relaxed'>
																	{(() => {
																		const description = normalizeText(
																			vacancy.description,
																		);
																		const html = isHTML(description);

																		return html ? (
																			<span
																				dangerouslySetInnerHTML={{
																					__html: description,
																				}}
																			/>
																		) : (
																			description
																		);
																	})()}
																</p>

																{vacancy.required?.trim() !== "" && (
																	<div className='mt-2'>
																		<p className='font-semibold text-[12px] mb-1 text-gray-800'>
																			Talab qilinadigan ko‘nikmalar:
																		</p>

																		<div className='flex flex-wrap gap-1'>
																			{vacancy.required
																				?.split(/[\n,]+/)
																				.map((skill, idx) => {
																					const s = skill.trim();
																					if (!s) return null;
																					return (
																						<span
																							key={idx}
																							className='px-2 py-[2px] bg-blue-100 text-blue-700 text-[11px] rounded-md border border-blue-200'
																						>
																							{s}
																						</span>
																					);
																				})}
																		</div>
																	</div>
																)}
															</div>
														</div>
													)}
												</div>
											);
										})
									)}
								</div>

								{downloadFileName && (
									<div className='flex justify-start'>
										<div
											className='max-w-[75%] p-2 rounded-lg text-xs shadow-sm'
											style={bubbleStyle("bot")}
										>
											<div className='flex items-center justify-between gap-2'>
												<div>
													<p className='font-medium text-xs'>{t.fileReady}</p>
													<p className='text-[11px] break-all'>
														{downloadFileName}
													</p>
												</div>
												<button
													onClick={() => downloadFile(downloadFileName)}
													className='py-1 px-2 rounded text-[12px] cursor-pointer'
													style={btnStyle("primary")}
												>
													{t.download}
												</button>
											</div>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							{selectedVacancy && !isFinished && messages.length > 1 && (
								<div
									className='border-t p-3'
									style={{ borderColor: "var(--ts-border)" }}
								>
									{/* <div
										className='flex gap-2 mb-2 overflow-x-auto whitespace-nowrap flex-nowrap buttons-scroll'
										style={{ paddingBottom: "4px" }}
									>
										<button
											onClick={() => {
												setMessages([]);
												setSelectedVacancy(null);
											}}
											className='px-3 py-1 text-[12px] rounded-md cursor-pointer border shrink-0'
											style={btnStyle("secondary")}
										>
											Vakansiyalar
										</button>

										<button
											onClick={triggerFileInput}
											disabled={isSubmitting || languageWidget === null}
											className='px-3 py-1 text-[12px] rounded-md cursor-pointer border shrink-0'
											style={btnStyle("primary", isUploading)}
										>
											Rezyume yuklash
										</button>
										<input
											ref={fileInputRef}
											type='file'
											accept='.pdf'
											className='hidden'
											onChange={onFileChange}
										/>

										<button
											onClick={handleCreateResume}
											disabled={isSubmitting || languageWidget === null}
											className='px-3 py-1 text-[12px] rounded-md cursor-pointer border shrink-0'
											style={btnStyle("secondary", isCreating)}
										>
											Rezyume yaratish
										</button>
									</div> */}

									<div className='flex items-end gap-2 w-full'>
										<div className='flex-1 relative'>
											<textarea
												ref={chatInputRef}
												value={inputMessage}
												disabled={languageWidget === null ? true : false}
												onChange={e => {
													setInputMessage(e.target.value);
													e.target.style.height = "auto";
													e.target.style.height =
														Math.min(e.target.scrollHeight, 300) + "px";
												}}
												onKeyDown={handleKeyPress}
												placeholder={t.placeholder}
												onFocus={() => setIsInputFocused(true)}
												onBlur={() => setIsInputFocused(false)}
												aria-label='Chat input'
												rows={1}
												className='chat-input w-full px-3 py-2 text-[13px] outline-none transition-all resize-none'
												style={glassy({
													background: "var(--ts-input-bg)",
													border: `1px solid ${
														isInputFocused
															? "#BFDBFE"
															: "var(--ts-input-border)"
													}`,
													boxShadow: isInputFocused
														? "0 0 0 3px rgba(191,219,254,.6)"
														: undefined,
													minHeight: "40px",
													maxHeight: "150px",
													overflowY: "auto",
													lineHeight: "1.5",
													paddingRight: "40px",
													paddingTop: "8px",
													paddingBottom: "8px",
													borderRadius: "20px",
												})}
											/>
										</div>
										<button
											onClick={() => sendMessage()}
											disabled={isSendDisabled}
											className='flex-shrink-0 cursor-pointer p-2 mb-1 rounded-full text-[13px] transition-transform focus:outline-none hover:translate-y-[-1px] flex items-center justify-center w-10 h-10'
											style={btnStyle("primary", isSendDisabled, {
												borderRadius: 9999,
											})}
										>
											{isLoading ? (
												<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
											) : (
												<SendHorizonal className='w-4 h-4' />
											)}
										</button>
									</div>
								</div>
							)}

							{/* {messages.length > 0 && isFinished && (
								<>
									<div
										className='border-t p-3'
										style={{ borderColor: "var(--ts-border)" }}
									>
										<button
											onClick={handleBackClick}
											className='w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none'
											style={btnStyle("secondary")}
										>
											{t.contactSoon}
										</button>{" "}
									</div>
								</>
							)} */}
							{messages.length > 0 && isFinished && (
								<div
									className='border-t p-3'
									style={{ borderColor: "var(--ts-border)" }}
								>
									{vacancyType === "both" ? (
										<div className='flex gap-2'>
											{" "}
											{/* Added a wrapper for layout */}
											<button
												onClick={handleBackClick}
												className='w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none'
												style={btnStyle("secondary")}
											>
												Video
											</button>
											<button
												onClick={handleBackClick}
												className='w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none'
												style={btnStyle("secondary")}
											>
												Wigit Test
											</button>
										</div>
									) : vacancyType === "widget" ? (
										<button
											onClick={handleBackClick}
											className='w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none'
											style={btnStyle("secondary")}
										>
											Wigit Test
										</button>
									) : vacancyType === "video" ? (
										<button
											onClick={handleBackClick}
											className='w-full py-2 cursor-pointer rounded-md text-[13px] transition-transform focus:outline-none'
											style={btnStyle("secondary")}
										>
											Video Test
										</button>
									) : null}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default IntegratedChatVacancy;
