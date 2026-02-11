import { useNavigate } from "react-router-dom"

const AnalyticsInsightsSection = () => {
    const navigate = useNavigate()
    return (
        <div className="max-w-6xl mx-auto text-center mb-20 px-4 ">
            <div className="bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-12 md:p-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Tezkor tahlillar orqali
                    <br />
                    kadr tanlashni tezlashtiramiz
                </h2>

                <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto">
                    JOB X sizning kompaniyangizga real vaqt rejimidagi tahlillarni taqdim etadi.
                    Nomzodlarning natijalarini kuzatish, tanlov jarayonini optimallashtirish va
                    eng mos xodimlarni tezroq topishga yordam beradi.
                </p>

                <button onClick={() => navigate("/login")} className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all duration-200 min-w-[180px]">
                    Boshlash
                </button>
            </div>
        </div>
    )
}

export default AnalyticsInsightsSection
