// src/main.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import type { WidgetConfig } from "./types/widget";
import AuthProvider from "./contexts/AuthContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";

function getConfigFromSearch(): WidgetConfig {
  const params = new URLSearchParams(window.location.search);
  return {
    theme: params.get("theme") ?? undefined,
    id: params.get("id") ?? undefined,
    siteName: params.get("siteName") ?? undefined,
    tenantId: params.get("tenantId") ?? undefined,
    publicKey: params.get("publicKey") ?? undefined,
    btnColor: params.get("btnColor") ?? undefined,
    btnTextColor: params.get("btnTextColor") ?? undefined,
    headerBg: params.get("headerBg") ?? undefined,
    headerText: params.get("headerText") ?? undefined,
    messageBg: params.get("messageBg") ?? undefined,
    messageText: params.get("messageText") ?? undefined,
    chatBg: params.get("chatBg") ?? undefined,
    userMessageBg: params.get("userMessageBg") ?? undefined,
    userMessageText: params.get("userMessageText") ?? undefined,
    bntColor: params.get("bntColor") ?? undefined,
    textColor: params.get("textColor") ?? undefined,
    sourceUrl: params.get("sourceUrl") ?? undefined,
    sourceOrigin: params.get("sourceOrigin") ?? undefined,
    referrer: params.get("referrer") ?? undefined,
    vacancyId: params.get("vacancyId") ?? undefined,
    vacancyTitle:
      params.get("vacancyTitle") ?? params.get("title") ?? undefined, // Support 'title' from URL
    title: params.get("title") ?? undefined,
    openWidget: params.get("openWidget") ?? params.get("autoOpen") ?? undefined,
    autoOpen: params.get("autoOpen") === "true",
  };
}

const Root: React.FC = () => {
  const [initialCfg] = useState<WidgetConfig>(getConfigFromSearch());
  const [remoteCfg, setRemoteCfg] = useState<WidgetConfig | null>(null);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      const candidate = e.data as { type?: string; payload?: WidgetConfig };
      if (candidate.type === "CSW_INIT" || candidate.type === "CSW_UPDATE") {
        console.log(
          "got CSW message in widget (postMessage):",
          candidate.payload,
        );
        setRemoteCfg((prev) => ({
          ...(prev ?? {}),
          ...(candidate.payload ?? {}),
        }));
      }
      // agar parent widget ichidagi loglarni qabul qilishni xohlasa
      if (candidate.type === "CSW_LOG") {
        console.log("parent forwarded log:", candidate.payload);
      }
    }
    window.addEventListener("message", onMessage);

    // initial configni ko'rsat

    return () => window.removeEventListener("message", onMessage);
  }, [initialCfg]);

  const mergedCfg: WidgetConfig = { ...initialCfg, ...(remoteCfg ?? {}) };

  if (!mergedCfg.btnColor && mergedCfg.bntColor) {
    mergedCfg.btnColor = mergedCfg.bntColor;
  }
  if (!mergedCfg.btnTextColor && mergedCfg.textColor) {
    mergedCfg.btnTextColor = mergedCfg.textColor;
  }
  console.log("merged widget config (final):", mergedCfg);

  const tenantId = mergedCfg.tenantId || mergedCfg.siteName || "siteA";

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App tenantId={tenantId} widgetConfig={mergedCfg} />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default Root;

createRoot(document.getElementById("root")!).render(<Root />);
