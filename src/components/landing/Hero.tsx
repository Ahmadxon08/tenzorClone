import { useNavigate } from "react-router-dom"
const Hero = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl transform -translate-x-32 translate-y-32"></div> */}
            <div className="relative z-10 container mx-auto px-6 py-12">
                <div className="flex justify-center mb-16">
                    {/* <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                        <span className="text-white/90 text-sm">
                            Ishga qabul jarayonlarini sun’iy intellekt yordamida soddalashtiring 🚀
                        </span>
                    </div> */}
                </div>
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-9xl font-bold text-white mb-6 leading-tight">
                        JOB
                        <span
                            className="inline-block text-[180px] bg-gradient-to-r from-gray-500 animate-pulse  via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x"
                            style={{
                                transform: "rotateY(-25deg) skewY(-10deg)",
                                display: "inline-block",
                            }}
                        >
                            X
                        </span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Ishga qabul qilishni tezkor , oson va samarali qiling
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={() => navigate("/chat")} className="border cursor-pointer border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors duration-200 min-w-[180px]">
                            AI botni sinab ko‘ring
                        </button>
                        <button onClick={() => navigate("/login")} className="bg-white cursor-pointer text-purple-900 px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors duration-200 min-w-[180px]">
                            Kabinetga kirish
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="bg-gray-800/50 border-b border-gray-700/50 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex space-x-6 text-sm text-gray-400">
                                        <span className="text-white">Suhbatlar</span>
                                        <span>Rezyumelar</span>
                                        <span>Analitika</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-3 space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-purple-600/20 rounded-lg">
                                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                                        </div>
                                        <span className="text-white font-medium">JobX AI</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3 p-2 text-gray-400 hover:text-white transition-colors">
                                            <div className="w-6 h-6 bg-purple-600 rounded"></div>
                                            <span className="text-sm">Umumiy suhbatlar</span>
                                        </div>
                                        <div className="flex items-center space-x-3 p-2 text-gray-400">
                                            <div className="w-6 h-6 bg-pink-600 rounded"></div>
                                            <span className="text-sm">Yaratilgan rezyumelar</span>
                                        </div>
                                        <div className="flex items-center space-x-3 p-2 text-gray-400">
                                            <div className="w-6 h-6 bg-blue-600 rounded"></div>
                                            <span className="text-sm">Kompaniyalar foydalangan</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-9">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-white text-lg font-semibold">Umumiy suhbatlar</h3>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-3xl font-bold text-white">125,000+</span>
                                                <span className="text-green-400 text-sm">+15%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-gray-400 text-sm">2025 yil</span>
                                            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">500+ kompaniya</div>
                                        </div>
                                    </div>
                                    <div className="relative h-64 bg-gray-800/30 rounded-lg p-4">
                                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                                            <span>200K</span>
                                            <span>150K</span>
                                            <span>100K</span>
                                            <span>50K</span>
                                            <span>0</span>
                                        </div>
                                        <div className="ml-8 h-full relative">
                                            <svg className="w-full h-full" viewBox="0 0 400 200">
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M 0 150 Q 50 120 100 100 T 200 80 T 300 90 T 400 70 L 400 200 L 0 200 Z"
                                                    fill="url(#chartGradient)"
                                                />
                                                <path
                                                    d="M 0 150 Q 50 120 100 100 T 200 80 T 300 90 T 400 70"
                                                    stroke="#8b5cf6"
                                                    strokeWidth="3"
                                                    fill="none"
                                                />
                                                <circle cx="300" cy="90" r="4" fill="#8b5cf6" stroke="#1f2937" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
