import { Key, FileText } from 'lucide-react'

const FeaturesSection = () => {
    return (
        <div className="py-20 px-4 max-w-6xl mx-auto">
            <div className="">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        AI kuchi bilan
                        <br />
                        kadr tanlashni
                        <br />
                        soddalashtiramiz
                    </h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        JOB X sizning kompaniyangiz uchun ishchi tanlash jarayonini
                        avtomatlashtiradi. Resume yaratishdan tortib, nomzodlarni
                        baholashgacha — hammasi bitta platformada.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group flex flex-col h-full">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors duration-300">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">AI Resume Builder</h3>
                            <p className="text-white/70 leading-relaxed mb-6">
                                Nomzodlar AI chat orqali savollarga javob beradi va tizim
                                avtomatik ravishda professional resume yaratadi. HR uchun
                                vaqtni tejash va sifatli nomzodlarni ko‘rish imkoniyati.
                            </p>
                        </div>
                        <a
                            href="/chat"
                            className="mt-auto text-white hover:text-cyan-300 transition-colors duration-200 font-medium underline underline-offset-4"
                        >
                            Demo ko‘rish
                        </a>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group flex flex-col h-full">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors duration-300">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Admin Panel Tokens</h3>
                            <p className="text-white/70 leading-relaxed mb-6">
                                Har bir kompaniya login qilgach, o‘ziga xos token oladi.
                                Shu token orqali widgetni saytiga o‘rnatishi va JOB X HR
                                funksiyalaridan foydalanishi mumkin.
                            </p>
                        </div>
                        <a
                            href="/login"
                            className="mt-auto text-white hover:text-cyan-300 transition-colors duration-200 font-medium underline underline-offset-4"
                        >
                            Admin panelga o‘tish
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeaturesSection
