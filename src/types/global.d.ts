// src/global.d.ts
interface Translation {
  siteName: string;
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
  vacancySelected?: string; // Ixtiyoriy, vakansiya tanlash xabari uchun
  frontendDescription?: string; // Ixtiyoriy, standart vakansiya ta'rifi uchun
  backendDescription?: string;
}

interface Translations {
  uz: Translation;
  ru: Translation;
  en: Translation;
}

interface WidgetConfig {
  widgetUrl: string;
  theme: string;
  width: string;
  height: string;
  position: string;
  siteName: string;
  publicKey: string;
  bntColor: string;
  textColor: string;
  lang: string;
  translations: Translations;
}

declare global {
  interface Window {
    WIDGET?: WidgetConfig;
    CSW?: {
      create: (config: Partial<WidgetConfig>) => WidgetConfig;
    };
  }
}