// src/types/widget.ts
export type WidgetConfig = {
  theme?: string;
  id?: string;
  siteName?: string;
  tenantId?: string;
  publicKey?: string;
  btnColor?: string;
  btnTextColor?: string;
  headerBg?: string;
  headerText?: string;
  messageBg?: string;
  messageText?: string;
  chatBg?: string;
  userMessageBg?: string;
  userMessageText?: string;
  bntColor?: string;
  textColor?: string;
  sourceUrl?: string;     // parent sahifa to'liq URL
  sourceOrigin?: string;  // parent origin (https://...)
  referrer?: string;      // document.referrer
  vacancyId?: string;
  vacancyTitle?: string;
  openWidget?: string;
  autoOpen?: boolean;
  public_key?: string; // Explicitly adding this to avoid index signature widening
  title?: string;
  [key: string]: string | number | boolean | undefined;
};
