import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { X, Menu } from "lucide-react"
import LanguageSelector from "../LanguageSelector"

const Navbar: React.FC = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && open) {
                setOpen(false)
            }
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [open])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.body.style.overflow = "unset"
        }
    }, [open])

    const links = [
        { id: "home", label: t('navbar.home') },
        { id: "partners", label: t('navbar.partners') },
        { id: "features", label: t('navbar.features') },
        { id: "collaboration", label: t('navbar.collaboration') },
        { id: "analytics", label: t('navbar.analytics') },
    ]

    return (
        <nav className="bg-[#0B0121] border-b border-[#ECECEC]/20 fixed top-0 w-full z-[90]">
            <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    JOB
                    <span
                        className="inline-block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-gray-500 animate-pulse via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x"
                        style={{
                            transform: "rotateY(-25deg) skewY(-10deg)",
                            display: "inline-block",
                        }}
                    >
                        X
                    </span>
                </h1>
                <ul className="hidden lg:flex space-x-6 xl:space-x-8 font-medium">
                    {links.map((link) => (
                        <li key={link.id}>
                            <a
                                href={`#${link.id}`}
                                className="block py-2 px-3 text-white hover:text-blue-400 transition-colors duration-200 text-sm xl:text-base"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="hidden lg:flex items-center gap-3">
                    {/* Language Selector */}
                    <LanguageSelector variant="navbar" />
                    
                    <button
                        onClick={() => navigate("/login")}
                        type="button"
                        className="text-white bg-blue-700 cursor-pointer hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 xl:px-5 xl:py-2.5 transition-colors duration-200"
                    >
                        {t('navbar.login')}
                    </button>
                </div>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="lg:hidden inline-flex items-center cursor-pointer justify-center p-2 w-11 h-11 text-[#ECECEC] hover:bg-[#1c1235] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECECEC] transition-colors duration-200"
                    aria-label={open ? t('common.close') : t('common.open')}
                >
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden z-40 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <div
                className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0B0121] border-l border-[#ECECEC]/20 transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-[#ECECEC]/20">
                        <h2 className="text-xl font-semibold text-white">{t('navbar.navigation')}</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 text-[#ECECEC] cursor-pointer hover:bg-[#1c1235] rounded-lg transition-colors duration-200 touch-manipulation"
                            aria-label={t('common.close')}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 px-6 py-8">
                        <div className="space-y-2">
                            {links.map((link, index) => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen(false);
                                    }}
                                    className="block text-lg text-white hover:text-blue-400 hover:bg-[#1c1235] px-4 py-3 rounded-lg transition-all duration-200 touch-manipulation"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation: open ? "slideInRight 0.4s ease-out forwards" : "none",
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        
                        {/* Language Selector in Mobile Menu */}
                        <div className="mt-6 pt-6 border-t border-[#ECECEC]/20">
                            <div className="mb-4">
                                <LanguageSelector variant="standalone" />
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/login");
                                    setOpen(false);
                                }}
                                className="w-full text-white cursor-pointer bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200 touch-manipulation"
                                style={{
                                    animationDelay: `${links.length * 0.1}s`,
                                    animation: open ? "slideInRight 0.4s ease-out forwards" : "none",
                                }}
                            >
                                {t('navbar.login')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style
                //@ts-ignore
                jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </nav>
    )
}

export default Navbar