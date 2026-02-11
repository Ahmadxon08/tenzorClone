import React, { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Minus,
  Send,
  ChevronLeft,
  ChevronDown,
  UserRound,
  Save,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import WidgetIcon from "../assets/icons/Widget.icon";
import { Checkbox, Select } from "antd";
const { Option } = Select;
import { apiService } from "../services/api";

interface Site {
  id: number;
  site_name: string;
  is_new: boolean;
  public_key?: string;
}

interface WidgetConfig {
  position: "right" | "left";
  height: string;
  theme?: string;
  btnColor: string;
  btnTextColor: string;
  headerBg: string;
  headerText: string;
  messageBg: string;
  messageText: string;
  chatBg: string;
  userMessageBg: string;
  userMessageText: string;
  sticked?: boolean;
  iconUrl?: string;
}

interface MockVacancy {
  id: number;
  title: string;
  salary: string;
  applied: boolean;
}

interface WidgetConfiguratorProps {
  site: Site;
  onClose: () => void;
}

type PresetTheme = {
  name: string;
  theme?: string;
  btnColor: string;
  btnTextColor: string;
  headerBg: string;
  headerText: string;
  messageBg: string;
  messageText: string;
  chatBg: string;
  userMessageBg: string;
  userMessageText: string;
};

// ----------------- PRESETS -----------------
const presetThemes: PresetTheme[] = [
  {
    name: "Moviy",
    theme: "classic-blue",
    btnColor: "linear-gradient(90deg,#2563eb 0%,#4f46e5 100%)",
    btnTextColor: "#ffffff",
    headerBg: "linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)",
    headerText: "#ffffff",
    messageBg: "#3b82f6",
    messageText: "#ffffff",
    chatBg: "#f9fafb",
    userMessageBg: "#e5e7eb",
    userMessageText: "#1f2937",
  },
  {
    name: "Yashil",
    theme: "emerald",
    btnColor: "linear-gradient(90deg,#10b981 0%,#16a34a 100%)",
    btnTextColor: "#ffffff",
    headerBg: "linear-gradient(135deg,#065f46 0%,#10b981 100%)",
    headerText: "#E8FFF3",
    messageBg: "#22c55e",
    messageText: "#ffffff",
    chatBg: "#f0fdf4",
    userMessageBg: "#dcfce7",
    userMessageText: "#065f46",
  },
  {
    name: "Qora",
    theme: "noir",
    btnColor: "linear-gradient(90deg,#0f172a 0%,#1f2937 100%)",
    btnTextColor: "#ffffff",
    headerBg: "linear-gradient(135deg,#0b1220 0%,#111827 100%)",
    headerText: "#e5e7eb",
    messageBg: "#374151",
    messageText: "#ffffff",
    chatBg: "#f3f4f6",
    userMessageBg: "#e5e7eb",
    userMessageText: "#111827",
  },
  // Glass — Indigo (klassik)
  {
    name: "Glassmorphism (Indigo)",
    theme: "glassmorphism",
    btnColor: "rgba(59,130,246,0.38)",
    btnTextColor: "#f8fafc",
    headerBg:
      "linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(59,130,246,0.45) 100%)",
    headerText: "#E8F0FF",
    messageBg: "rgba(59,130,246,0.38)",
    messageText: "#F8FAFC",
    chatBg: "rgba(17,25,40,0.28)",
    userMessageBg: "rgba(148,163,184,0.32)",
    userMessageText: "#F8FAFC",
  },
  // Glass — Dark Frost (yanada qoramtir, kuchli shisha)
  {
    name: "Glassmorphism (Dark Frost)",
    theme: "glassmorphism",
    btnColor: "rgba(99,102,241,0.40)",
    btnTextColor: "#F5F7FF",
    headerBg:
      "linear-gradient(135deg, rgba(17,24,39,0.65) 0%, rgba(30,41,59,0.55) 100%)",
    headerText: "#E6ECFF",
    messageBg: "rgba(59,130,246,0.34)",
    messageText: "#F1F5F9",
    chatBg: "rgba(2,6,23,0.30)",
    userMessageBg: "rgba(71,85,105,0.35)",
    userMessageText: "#F8FAFC",
  },
  // Glass — Light Frost (yorug‘, oqsuv)
  {
    name: "Glassmorphism (Light Frost)",
    theme: "glassmorphism",
    btnColor: "rgba(59,130,246,0.30)",
    btnTextColor: "#0f172a",
    headerBg:
      "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(226,232,240,0.70) 100%)",
    headerText: "#0f172a",
    messageBg: "rgba(59,130,246,0.22)",
    messageText: "#0f172a",
    chatBg: "rgba(255,255,255,0.75)",
    userMessageBg: "rgba(226,232,240,0.55)",
    userMessageText: "#0f172a",
  },
];

const mockMessages = [
  { type: "bot", text: "Salom! Ish bilan bog'liq savollaringiz bormi?" },
  { type: "user", text: "Ha, vakansiyalar haqida ma'lumot olmoqchiman" },
  { type: "bot", text: "Albatta! Qaysi lavozimga qiziqasiz?" },
  { type: "user", text: "Frontend developer" },
  {
    type: "bot",
    text: "Ajoyib! Frontend bo‘yicha ochiq vakansiya bor. Ismingizni yozib qoldiring.",
  },
];

const previewVacancies = [
  {
    id: 1,
    title: "Frontend Developer",
    salary: "8 000 000 – 12 000 000 UZS",
    description: "React, TypeScript va Tailwind bilan tajriba talab qilinadi.",
  },
];

const WidgetConfigurator: React.FC<WidgetConfiguratorProps> = ({
  site,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const { t } = useTranslation();
  const [active, setActive] = useState<"list" | "icon">("list");

  const token = localStorage.getItem("access_token") || "";

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    position: "right",
    height: "500px",
    theme: presetThemes[0].theme,
    btnColor: presetThemes[0].btnColor,
    btnTextColor: presetThemes[0].btnTextColor,
    headerBg: presetThemes[0].headerBg,
    headerText: presetThemes[0].headerText,
    messageBg: presetThemes[0].messageBg,
    messageText: presetThemes[0].messageText,
    chatBg: presetThemes[0].chatBg,
    userMessageBg: presetThemes[0].userMessageBg,
    userMessageText: presetThemes[0].userMessageText,
  });

  const widgetPositions = [
    { value: "right", label: t("widgetConfigurator.positionRight") },
    { value: "left", label: t("widgetConfigurator.positionLeft") },
  ];
  const handleConfigChange = (
    key: keyof WidgetConfig,
    value: string | boolean
  ) => {
    setWidgetConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (
        key !== "theme" &&
        key !== "position" &&
        key !== "height" &&
        prev.theme !== "custom"
      ) {
        next.theme = "custom";
      }
      return next;
    });
  };

  const applyPreset = (preset: PresetTheme) => {
    setWidgetConfig((prev) => ({
      ...prev,
      theme: preset.theme,
      btnColor: preset.btnColor,
      btnTextColor: preset.btnTextColor,
      headerBg: preset.headerBg,
      headerText: preset.headerText,
      messageBg: preset.messageBg,
      messageText: preset.messageText,
      chatBg: preset.chatBg,
      userMessageBg: preset.userMessageBg,
      userMessageText: preset.userMessageText,
    }));
  };
  const themeKey = (widgetConfig.theme ?? "").toLowerCase().trim();
  const isGlassPreview = themeKey.startsWith("glassmorphism");

  const bgFrom = (val: string) =>
    val?.toLowerCase().includes("gradient")
      ? { background: val }
      : { backgroundColor: val };

  const glassy = (extra?: React.CSSProperties): React.CSSProperties =>
    isGlassPreview
      ? {
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 28px 70px rgba(15,23,42,0.36)",
        ...extra,
      }
      : { ...extra };

  const btnStyle = (
    variant: "primary" | "secondary",
    disabled?: boolean,
    extra?: React.CSSProperties
  ): React.CSSProperties => {
    if (disabled) {
      return glassy({
        background: isGlassPreview
          ? "rgba(148,163,184,0.28)"
          : "rgba(2,8,23,0.08)",
        color: isGlassPreview ? "rgba(241,245,249,0.7)" : "rgba(2,6,23,0.55)",
        cursor: "not-allowed",
        boxShadow: "none",
        ...extra,
      });
    }
    const base =
      variant === "primary"
        ? bgFrom(widgetConfig.btnColor)
        : bgFrom(widgetConfig.messageBg);
    const color =
      variant === "primary"
        ? widgetConfig.btnTextColor
        : widgetConfig.messageText;
    return glassy({
      ...base,
      color,
      transition: "transform .15s ease, opacity .15s ease",
      ...extra,
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    try {
      const updated = await apiService.UpdateWidgetLogo(file, site.id, token);
      console.log("Logo updated:", updated);

      setWidgetConfig((prev) => ({
        ...prev,
        iconUrl: updated.icon_url,
      }));
    } catch (err) {
      console.error("Failed to upload icon:", err);
    }
  };

  const saveWidgetConfig = async (
    payload: any,
    siteId: number,
    token: string
  ) => {
    const hasWidget =
      Array.isArray((site as any).site_widget_fields) &&
      (site as any).site_widget_fields.length > 0;
    console.log(payload, "this is payload");
    if (hasWidget) {
      return apiService.UpdateWidgetInfo(payload, siteId, token);
    } else {
      // CREATE
      return apiService.CreateWidgetInfo(payload, siteId, token);
    }
  };

  useEffect(() => {
    if (!site || !token) return;

    apiService
      .getSites(token)
      .then(async (sites) => {
        const foundSite = sites.find((s) => s.site_name === site.site_name);
        const fields = foundSite?.site_widget_fields?.[0];

        if (!fields) {
          console.log(
            "No settings found for this site. Auto-saving defaults..."
          );

          const defaultPayload = {
            position: widgetConfig.position,
            siteName: site.site_name,
            height: widgetConfig.height,
            theme: widgetConfig.theme || "classic-blue",
            publicKey: site.public_key || "",
            btnColor: widgetConfig.btnColor,
            btnTextColor: widgetConfig.btnTextColor,
            headerBg: widgetConfig.headerBg,
            headerText: widgetConfig.headerText,
            messageBg: widgetConfig.messageBg,
            messageText: widgetConfig.messageText,
            chatBg: widgetConfig.chatBg,
            userMessageBg: widgetConfig.userMessageBg,
            userMessageText: widgetConfig.userMessageText,
            widgetType: active || "list",
            iconUrl: widgetConfig.iconUrl || "",
            sticked: widgetConfig.sticked || false,
          };

          try {
            await apiService.CreateWidgetInfo(defaultPayload, site.id, token);
            console.log("Default settings auto-saved successfully.");
          } catch (err) {
            console.error("Auto-save failed:", err);
          }
          return;
        }
        setActive(fields.widgetType);
        setWidgetConfig({
          position: fields.position ?? "right",
          height: fields.height ?? "500px",
          theme: fields.theme ?? presetThemes[0].theme,
          btnColor: fields.btnColor ?? presetThemes[0].btnColor,
          btnTextColor: fields.btnTextColor ?? presetThemes[0].btnTextColor,
          headerBg: fields.headerBg ?? presetThemes[0].headerBg,
          headerText: fields.headerText ?? presetThemes[0].headerText,
          messageBg: fields.messageBg ?? presetThemes[0].messageBg,
          messageText: fields.messageText ?? presetThemes[0].messageText,
          chatBg: fields.chatBg ?? presetThemes[0].chatBg,
          userMessageBg: fields.userMessageBg ?? presetThemes[0].userMessageBg,
          userMessageText:
            fields.userMessageText ?? presetThemes[0].userMessageText,
          sticked: fields.sticked ?? false,
          iconUrl: fields.iconUrl ?? "",
        });
      })
      .catch(console.error);
  }, [site, token]);

  const handleSaveWidget = async () => {
    setSaving(true);
    const payload = {
      position: widgetConfig.position,
      siteName: site.site_name,
      height: widgetConfig.height,
      theme: widgetConfig.theme || "",
      publicKey: site.public_key || "",
      btnColor: widgetConfig.btnColor,
      btnTextColor: widgetConfig.btnTextColor,
      headerBg: widgetConfig.headerBg,
      headerText: widgetConfig.headerText,
      messageBg: widgetConfig.messageBg,
      messageText: widgetConfig.messageText,
      chatBg: widgetConfig.chatBg,
      userMessageBg: widgetConfig.userMessageBg,
      userMessageText: widgetConfig.userMessageText,
      widgetType: active || "",
      iconUrl: widgetConfig.iconUrl || "",
      sticked: widgetConfig.sticked || false,
    };

    try {
      await saveWidgetConfig(payload, site.id, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save widget config:", err);
    } finally {
      setSaving(false);
    }
  };

  const bubbleStyle = (who: "user" | "bot" | "system"): React.CSSProperties => {
    if (who === "user")
      return glassy({
        ...bgFrom(widgetConfig.userMessageBg),
        color: widgetConfig.userMessageText,
        borderRadius: "16px 16px 4px 16px",
      });
    if (who === "bot")
      return glassy({
        ...bgFrom(widgetConfig.messageBg),
        color: widgetConfig.messageText,
        borderRadius: "16px 16px 16px 4px",
      });
    return glassy({
      backgroundColor: isGlassPreview ? "rgba(15,23,42,0.42)" : "#f1f5f9",
      color: isGlassPreview ? "#E2E8F0" : "#475569",
      borderRadius: 12,
    });
  };

  const generateScript = () => {
    if (!site.public_key) return "";
    return `<!-- Jobx widget script -->
<script src="https://my.jobx.uz/widget-loader.js"></script>
<script>
  window.WIDGET = window.CSW && window.CSW.create({
    widgetUrl: "https://my.jobx.uz/widget.html",
    position: "${widgetConfig.position}",
    siteName: "${site.site_name}",
    height: "${widgetConfig.height}",
    theme: "${widgetConfig.theme ?? ""}",
    publicKey: "${site.public_key}",
    btnColor: "${widgetConfig.btnColor}",
    btnTextColor: "${widgetConfig.btnTextColor}",
    headerBg: "${widgetConfig.headerBg}",
    headerText: "${widgetConfig.headerText}",
    messageBg: "${widgetConfig.messageBg}",
    messageText: "${widgetConfig.messageText}",
    chatBg: "${widgetConfig.chatBg}",
    userMessageBg: "${widgetConfig.userMessageBg}",
    userMessageText: "${widgetConfig.userMessageText}",
    iconUrl: "${widgetConfig.iconUrl}",
    widgetType: "${active || "list"}",
    sticked: ${widgetConfig.sticked || false}
  });
</script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const mockData = t("widgetConfigurator.mockData", {
    returnObjects: true,
  }) as MockVacancy[];

  return (
    <div className="space-y-6">
      <style>{`
        /* Glass dekorlari */
        .pv-shimmer{position:absolute;inset:-200%;transform:skewX(-12deg);
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
          animation:pvsh 1.8s linear infinite;opacity:0}
        .pv-launch:hover .pv-shimmer{opacity:1}
        @keyframes pvsh{0%{transform:translateX(-60%) skewX(-12deg)}
          100%{transform:translateX(60%) skewX(-12deg)}}
        .pv-bubbles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .pv-bubbles:before,.pv-bubbles:after{content:"";position:absolute;width:220px;height:220px;border-radius:50%;filter:blur(18px)}
        .pv-bubbles:before{top:-40px;left:-30px;background:radial-gradient(closest-side,rgba(255,255,255,.35),rgba(255,255,255,0));opacity:.55;animation:floatA 9s ease-in-out infinite}
        .pv-bubbles:after{bottom:-50px;right:-50px;background:radial-gradient(closest-side,rgba(59,130,246,.55),rgba(59,130,246,0));opacity:.35;animation:floatB 11s ease-in-out infinite}
        @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      `}</style>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("widgetConfigurator.header")}
          </h1>
          <p className="text-gray-400">{site.site_name}</p>
        </div>
        <button
          onClick={onClose}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium transition-all"
        >
          <X size={18} />
          {t("common.close")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Settings */}
        <div className="space-y-6">
          {site.public_key && (
            <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t("widgetConfigurator.publicKey")}
              </h3>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 font-mono break-all">
                  {site.public_key}
                </p>
              </div>
            </div>
          )}

          {/* Presets */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("widgetConfigurator.presets")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {presetThemes.map((preset) => (
                <button
                  key={preset.theme}
                  onClick={() => applyPreset(preset)}
                  className="group cursor-pointer relative overflow-hidden rounded-xl bg-[#0a1b30]/50 border border-white/10 hover:border-blue-500/50 transition-all p-4"
                >
                  <div className="space-y-2 mb-3">
                    <div
                      className="w-full h-6 rounded"
                      style={bgFrom(preset.headerBg)}
                    />
                    <div className="flex gap-1">
                      <div
                        className="flex-1 h-4 rounded"
                        style={bgFrom(preset.messageBg)}
                      />
                      <div
                        className="flex-1 h-4 rounded"
                        style={bgFrom(preset.userMessageBg)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    {t(`widgetConfigurator.${preset.name}`) || preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("widgetConfigurator.specialSettings")}
            </h3>

            {(
              [
                ["btnColor", "btnColor"],
                ["btnTextColor", "btnTextColor"],
                ["headerBg", "headerBg"],
                ["headerText", "headerText"],
                ["messageBg", "messageBg"],
                ["messageText", "messageText"],
                ["chatBg", "chatBg"],
                ["userMessageBg", "userMessageBg"],
                ["userMessageText", "userMessageText"],
              ] as Array<[keyof WidgetConfig, string]>
            ).map(([key, label]) => (
              <div key={key} className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  {t(`widgetConfigurator.${label}`)}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={widgetConfig[key] as string}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="w-14 h-10 rounded-lg cursor-pointer border-2 border-white/10"
                  />
                  <input
                    type="text"
                    value={widgetConfig[key] as string}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 bg-[#0a1b30]/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            ))}
            <div className="my-5">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t("widgetConfigurator.uploadIcon")}
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
           file:rounded-lg file:border-0
           file:text-sm file:font-semibold
           file:bg-blue-500/20 file:text-blue-400
           hover:file:bg-blue-500/30 cursor-pointer
           focus:outline-none"
                  onChange={(e) =>
                    e.target.files && handleLogoUpload(e.target.files[0])
                  }
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-300">
                {t("widgetConfigurator.widgetPosition")}
              </label>

              <Select
                value={widgetConfig.position}
                onChange={(val) => handleConfigChange("position", val)}
                className="w-full text-white"
                popupClassName="bg-[#0a1b30]/90 rounded-xl shadow-lg"
                style={{
                  background: "#0a1b30/50",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "0.75rem",
                  color: "white",
                  height: 48,
                }}
                dropdownMatchSelectWidth={false}
              >
                {widgetPositions.map((pos) => (
                  <Option
                    key={pos.value}
                    value={pos.value}
                    className="bg-[#0a1b30] text-white hover:bg-blue-500/30 rounded-2xl"
                  >
                    {pos.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={widgetConfig.sticked}
                onChange={(e) =>
                  handleConfigChange("sticked", e.target.checked)
                }
              >
                <span className="text-white">
                  {t("widgetConfigurator.stickedToScreen")}
                </span>
              </Checkbox>
            </div>
            <button
              onClick={handleSaveWidget}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all mt-5"
            >
              {saved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </button>
          </div>

          {/* Script */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t("widgetConfigurator.readyScript")}
              </h3>
              <button
                onClick={copyToClipboard}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-all"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    {t("widgetConfigurator.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {t("widgetConfigurator.copy")}
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#0a1b30]/80 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto border border-white/10 max-h-80">
              {generateScript()}
            </pre>
            <p className="text-xs text-gray-400 mt-3">
              {t("widgetConfigurator.installationNote")}
            </p>
          </div>
        </div>
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("widgetConfigurator.preview")}
            </h3>

            <div className="relative">
              <div className="flex gap-2 items-center justify-evenly mb-6">
                <button
                  aria-label="Open Chat"
                  onClick={() => setActive("list")}
                  style={
                    active === "list"
                      ? btnStyle("primary", false, {
                        borderRadius: widgetConfig.sticked
                          ? "20px 0 0 20px"
                          : "20px 20px 0 0",
                        paddingLeft: widgetConfig.sticked ? 8 : 16,
                        paddingRight: widgetConfig.sticked ? 8 : 16,
                        height: widgetConfig.sticked ? 150 : 36,
                      })
                      : {
                        borderRadius: widgetConfig.sticked
                          ? "20px 0 0 20px"
                          : "20px 20px 0 0",
                        paddingLeft: widgetConfig.sticked ? 8 : 16,
                        paddingRight: widgetConfig.sticked ? 8 : 16,
                        height: widgetConfig.sticked ? 150 : 36,
                        background: "rgba(148,163,184,0.25)",
                        border: "1px solid rgba(148,163,184,0.35)",
                      }
                  }
                  className={`open-chat-button ${active === "list" ? "wave-pulse" : " text-white"
                    }`}
                  title="Bo'sh ish o'rinlar"
                >
                  <div
                    className={`relative flex items-center gap-2 z-10  ${widgetConfig.sticked ? "vertical-text" : ""
                      }`}
                  >
                    <span
                      className={widgetConfig.sticked ? "vertical-icon" : ""}
                    >
                      <UserRound className="w-4 h-4" />
                    </span>
                    <span>Bo'sh ish o'rinlar</span>
                  </div>
                </button>

                <button
                  aria-label="Open Chat Widget"
                  onClick={() => setActive("icon")}
                  style={{
                    padding: 10,
                    background:
                      active === "icon"
                        ? btnStyle("primary", false).background
                        : "rgba(148,163,184,0.25)",
                    color: active === "icon" ? "#fff" : "#475569",
                    border:
                      active === "icon"
                        ? btnStyle("primary", false).border
                        : "1px solid rgba(148,163,184,0.35)",
                    borderRadius: widgetConfig.sticked
                      ? "20px 0 0 20px"
                      : "50%",
                  }}
                  className={`open-chat-button ${active === "icon" ? "wave-pulse text-white" : ""
                    }`}
                  title="Bo'sh ish o'rinlar"
                >
                  <WidgetIcon />
                </button>
              </div>

              {!chatOpen && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setChatOpen(true)}
                    className="pv-launch cursor-pointer relative flex items-center gap-2 rounded-full shadow-2xl transition-all hover:scale-105 border border-transparent px-6 py-3"
                    style={btnStyle("primary")}
                  >
                    {isGlassPreview && <div className="pv-shimmer" />}
                    <MessageCircle size={22} />
                    <span className="font-medium">
                      {t("widgetConfigurator.chat")}
                    </span>
                  </button>
                </div>
              )}

              {chatOpen && (
                <div
                  className="w-full rounded-2xl overflow-hidden relative"
                  style={glassy(bgFrom(widgetConfig.chatBg))}
                >
                  {isGlassPreview && <div className="pv-bubbles" />}

                  <div
                    className="px-6 py-4 flex items-center justify-between gap-3 relative"
                    style={glassy({
                      ...bgFrom(widgetConfig.headerBg),
                      color: widgetConfig.headerText,
                      borderBottom: "1px solid rgba(255,255,255,0.18)",
                    })}
                  >
                    <div>
                      <h4 className="font-semibold text-lg">
                        {site.site_name}
                      </h4>
                      <p className="text-sm opacity-90">
                        {t("widgetConfigurator.HRdepartment")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChatOpen(false)}
                        className="p-1 rounded-lg transition-all cursor-pointer "
                        style={glassy({
                          color: widgetConfig.headerText,
                          background: isGlassPreview
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(255,255,255,0.18)",
                        })}
                      >
                        <Minus size={20} />
                      </button>
                      <button
                        onClick={() => setChatOpen(false)}
                        className="p-1 rounded-lg transition-all cursor-pointer "
                        style={glassy({
                          color: widgetConfig.headerText,
                          background: isGlassPreview
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(255,255,255,0.18)",
                        })}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-6 space-y-4 h-96 overflow-y-auto"
                    style={bgFrom(widgetConfig.chatBg)}
                  >
                    {mockMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div
                          className="max-w-[75%] px-4 py-3 rounded-2xl shadow-sm"
                          style={bubbleStyle(
                            msg.type === "user" ? "user" : "bot"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-start">
                      <div
                        className="px-4 py-3 rounded-2xl shadow-sm"
                        style={bubbleStyle("bot")}
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="inline-block w-2 h-2 rounded-full animate-bounce"
                              style={{
                                backgroundColor: isGlassPreview
                                  ? "rgba(255,255,255,0.85)"
                                  : "rgba(148,163,184,0.9)",
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-2 border rounded-lg p-3 space-y-2 transition-all"
                      style={glassy({
                        borderColor: isGlassPreview
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(148,163,184,0.35)",
                        background: isGlassPreview
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(241,245,249,0.6)",
                      })}
                    >
                      {previewVacancies.map((v) => (
                        <div key={v.id} className="space-y-1 text-sm">
                          <div className="font-semibold">{v.title}</div>
                          <div
                            className="text-xs font-medium"
                            style={{ color: widgetConfig.btnTextColor }}
                          >
                            {v.salary}
                          </div>
                          <p className="text-xs text-gray-300">
                            {v.description}
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button
                              className="px-3 py-1 cursor-pointer rounded-md text-xs hover:translate-y-[-1px]"
                              style={btnStyle("primary")}
                            >
                              {t("widgetConfigurator.chat")}
                            </button>
                            <button
                              className="px-3 py-1 cursor-pointer rounded-md text-xs hover:translate-y-[-1px]"
                              style={btnStyle("secondary")}
                            >
                              {t("widgetConfigurator.typeMessage")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="px-4 py-4 border-t"
                    style={glassy({
                      ...bgFrom(widgetConfig.chatBg),
                      borderTop: "1px solid rgba(255,255,255,0.18)",
                    })}
                  >
                    <div
                      className="flex gap-3 mb-3 px-1 overflow-x-auto buttons-scroll"
                      style={{ scrollBehavior: "smooth" }}
                    >
                      <button
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs hover:translate-y-[-1px] shrink-0"
                        style={btnStyle("primary")}
                      >
                        Chat
                      </button>

                      <button
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs hover:translate-y-[-1px] shrink-0"
                        style={btnStyle("secondary")}
                      >
                        Vakansiyalar ro'yhati
                      </button>

                      <button
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs hover:translate-y-[-1px] shrink-0"
                        style={btnStyle("secondary")}
                      >
                        Rezyume yuklash
                      </button>

                      <button
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs hover:translate-y-[-1px] shrink-0"
                        style={btnStyle("secondary")}
                      >
                        Rezyume yaratish
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={t("widgetConfigurator.typeMessage")}
                        className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all"
                        style={glassy({
                          background: isGlassPreview
                            ? "rgba(255,255,255,0.12)"
                            : "#ffffff",
                          border: `1px solid ${isGlassPreview
                              ? "rgba(255,255,255,0.28)"
                              : "rgba(15,23,42,0.12)"
                            }`,
                          color: isGlassPreview
                            ? presetThemes[3].btnTextColor
                            : "#0f172a",
                        })}
                      />
                      <button
                        className="p-2 cursor-pointer rounded-full shadow-lg transition-all hover:scale-105 border border-transparent"
                        style={btnStyle("primary", false, {
                          borderRadius: 9999,
                          padding: 10,
                        })}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="mt-4 rounded-2xl"
              style={glassy({
                background: widgetConfig.chatBg,
              })}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between mb-3 rounded-t-2xl p-4"
                style={glassy({
                  ...bgFrom(widgetConfig.headerBg),
                  color: widgetConfig.headerText,
                  borderBottom: "1px solid rgba(255,255,255,0.18)",
                })}
              >
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Back"
                    className="cursor-pointer p-1 rounded-md w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-85"
                    style={{ color: "var(--ts-header-text)" }}
                  >
                    <ChevronLeft className="min-w-5 min-h-5" />
                  </button>

                  <div>
                    <h1
                      className="text-[13px] font-medium"
                      style={{ color: "var(--ts-header-text)" }}
                    >
                      TenzorSoft
                    </h1>
                    <div
                      className="ml-[2px] text-[10px] opacity-90"
                      style={{ color: "var(--ts-header-text)" }}
                    >
                      Kadrlar bo'limi
                    </div>
                  </div>
                </div>

                <a
                  href="#"
                  className="text-[11px] font-medium underline"
                  style={{ color: "var(--ts-header-text)" }}
                >
                  Jobx uz
                </a>
              </div>

              <div className="p-3">
                {mockData.map((item) => (
                  <div
                    key={item.id}
                    className="rounded  shadow-sm px-3 py-3 mb-3"
                    // style={{
                    //   background: "#ffffff",
                    //   borderColor: "#e6e6e6",
                    // }}
                    style={bubbleStyle("user")}
                  >
                    <div className="flex items-start justify-between">
                      {/* LEFT SIDE */}
                      <div>
                        <h3 className="text-sm font-semibold">{item.title}</h3>

                        <div className="flex flex-col mt-1 text-xs font-medium text-blue-600">
                          {!item.salary || item.salary === "N/A" ? (
                            <span className="">N/A</span>
                          ) : (
                            <span>{item.salary}</span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="flex flex-col items-end gap-1">
                        {/* Apply button */}
                        <button
                          disabled={item.applied}
                          className="px-3 py-[4px] text-xs rounded-md cursor-pointer"
                          style={{
                            background: item.applied
                              ? "#E5E7EB"
                              : widgetConfig.btnColor,
                            color: item.applied
                              ? "#9CA3AF"
                              : widgetConfig.btnTextColor,
                          }}
                        >
                          {item.applied ? "Topshirildi" : "Ariza yuborish"}
                        </button>

                        <button className="p-1 text-gray-400 cursor-pointer hover:text-gray-600">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400 font-medium mb-1">
              {t("widgetConfigurator.advice")}
            </p>
            <p className="text-xs text-gray-400">
              {t("widgetConfigurator.customizeNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigurator;
