import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WidgetConfig } from "../types/widget";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeConfig(raw: any): WidgetConfig {
  return {
    siteName: raw.siteName ?? raw.site_name,
    tenantId: raw.tenantId ?? raw.tenant_id,
    publicKey: raw.publicKey ?? raw.public_key,
    headerBg: raw.headerBg ?? raw.header_bg,
    headerText: raw.headerText ?? raw.header_text,
    chatBg: raw.chatBg ?? raw.chat_bg,
    messageBg: raw.messageBg ?? raw.message_bg,
    messageText: raw.messageText ?? raw.message_text,
    userMessageBg: raw.userMessageBg ?? raw.user_message_bg,
    userMessageText: raw.userMessageText ?? raw.user_message_text,
    btnColor: raw.btnColor ?? raw.btn_color,
    btnTextColor: raw.btnTextColor ?? raw.btn_text_color,
    textColor: raw.textColor ?? raw.text_color,
    id: raw.id,
    theme: raw.theme,
    bntColor: raw.bntColor ?? raw.bnt_color, 
    referrer: raw.referrer,
    sourceUrl: raw.sourceUrl,
    sourceOrigin: raw.sourceOrigin,
  };
}


