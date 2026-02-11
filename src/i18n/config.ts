// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationUZ from './locales/uz.json';
import translationRU from './locales/ru.json';
import translationEN from './locales/en.json';
// import translationUZ_CYRL from './locales/uz_cyrl.json';

const resources = {
    uz: {
        translation: translationUZ
    },
    ru: {
        translation: translationRU
    },
    en: {
        translation: translationEN
    },
    // uz_cyrl: {
    //     translation: translationUZ_CYRL
    // }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'uz',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;