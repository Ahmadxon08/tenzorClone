import { Check, Globe } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
    code: string;
    name: string;
    flag: string;
}
const languages: Language[] = [
    { code: 'uz', name: 'O\'zbekcha', flag: 'UZ' },
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'en', name: 'English', flag: 'EN' }
];
interface LanguageSelectorProps {
    variant?: 'navbar' | 'standalone' | 'dashboard';
}
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
        window.location.reload()
    };
    if (variant === 'dashboard') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group cursor-pointer flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0a1b30]/50 border border-white/10 hover:bg-[#0a1b30]/70 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/10"
                    aria-label="Change language"
                >
                    <Globe className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm font-medium">{currentLanguage.flag}</span>
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a1b30]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                        <div className="p-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full cursor-pointer text-left px-3.5 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-between gap-3 rounded-lg group ${currentLanguage.code === lang.code ? 'bg-blue-500/20 text-white border border-blue-500/30' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="text-sm font-medium">{lang.name}</span>
                                    </div>
                                    {currentLanguage.code === lang.code && (
                                        <Check className="w-4 h-4 text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    if (variant === 'standalone') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group cursor-pointer flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 min-w-[180px]"
                >
                    <Globe className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                    <span className="flex-1 text-left font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
                    <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                        <div className="p-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full cursor-pointer text-left px-4 py-3 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-between gap-3 rounded-lg group ${currentLanguage.code === lang.code ? 'bg-white/15 border border-white/20' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{lang.flag}</span>
                                        <span className="font-medium">{lang.name}</span>
                                    </div>
                                    {currentLanguage.code === lang.code && (
                                        <Check className="w-4 h-4 text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-[#1c1235] transition-all duration-200"
                aria-label="Change language"
            >
                <Globe className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-medium">{currentLanguage.flag}</span>
                <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0B0121] border border-[#ECECEC]/20 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-lg animate-fadeIn">
                    <div className="p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full cursor-pointer text-left px-3.5 py-3 text-white hover:bg-[#1c1235] transition-all duration-200 flex items-center justify-between gap-3 rounded-lg group ${currentLanguage.code === lang.code ? 'bg-[#1c1235] border border-blue-500/30' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* <span className="text-xl group-hover:scale-110 transition-transform duration-200">{lang.flag}</span> */}
                                    <span className="text-sm font-medium">{lang.name}</span>
                                </div>
                                {currentLanguage.code === lang.code && (
                                    <Check className="w-4 h-4 text-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default LanguageSelector;