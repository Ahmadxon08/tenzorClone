import { useState } from "react";

interface PlanFeature {
    text: string;
    hint?: string;
}

interface Plan {
    id: string;
    name: string;
    price: string;
    period?: string;
    features: PlanFeature[];
    highlight?: boolean;
}

const plans: Plan[] = [
    {
        id: "freemium",
        name: "Freemium",
        price: "0 so'm",
        features: [
            { text: "1 domen + widget" },
            { text: "1 ta aktiv vakansiya" },
            { text: "30 ta screening sessiya / oy (qisqa AI-saralash)" },
            { text: "basic score + savol-javoblarni ko'rish" },
            { text: "ma'lumot saqlash: 14 kun" },
            { text: "1 foydalanuvchi (HR)" },
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "299 000 so'm",
        period: "/ oy",
        features: [
            { text: "1 domen" },
            { text: "5 tagacha aktiv vakansiya" },
            { text: "200 ta screening sessiya / oy" },
            { text: "20 ta extended interview / oy" },
            { text: "arizalar filtrlari + HR izohlari" },
            { text: "XLSX eksport" },
            { text: "ma'lumot saqlash: 3 oy" },
            { text: "2 foydalanuvchi (HR + hiring manager)" },
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "899 000 so'm",
        period: "/ oy",
        highlight: true,
        features: [
            { text: "3 tagacha domen" },
            { text: "20 tagacha aktiv vakansiya" },
            { text: "1 000 ta screening sessiya / oy" },
            { text: "150 ta extended interview / oy" },
            { text: "Interview Links (ommaviy havolalar): 200 ta / oy" },
            { text: "vakansiya/savol shablonlari" },
            {
                text: "keng analitika",
                hint: "konversiya, drop-off, o'rtacha ball, savollar samarasi",
            },
            { text: "XLSX/PDF eksport" },
            { text: "5 foydalanuvchi" },
            { text: "ma'lumot saqlash: 12 oy" },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "1 990 000 so'm",
        period: "/ oy",
        features: [
            { text: "10 tagacha domen" },
            { text: "50 tagacha aktiv vakansiya" },
            { text: "3 000 ta screening sessiya / oy" },
            { text: "500 ta extended interview / oy" },
            { text: "Interview Links: 1 000 ta / oy" },
            { text: "rollar / huquqlar" },
            { text: "prioritet support" },
            { text: "chuqur analitika + hisobotlar" },
            { text: "15 foydalanuvchi" },
            { text: "ma'lumot saqlash: 24 oy" },
        ],
    },
];

const PlansPage = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>("growth");

    return (
        <div className="min-h-screen bg-[#0a1b30] p-6 md:p-12 font-sans text-white">
            <div className="max-w-[1650px] mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Business Model
                        </h1>
                        <div className="relative">
                            {/* Logo placeholder if needed, matching the image's top right */}
                            <div className="text-2xl font-bold tracking-tighter flex items-center gap-1">
                                <span>J</span>
                                <div className="relative flex items-center justify-center w-8 h-8 border-2 border-blue-500 rounded-md">
                                    <span className="text-blue-500 text-xs font-bold">JOBX</span>
                                    <div className="absolute inset-0 border border-t-transparent border-l-transparent border-blue-400 -rotate-12 scale-125 pointer-events-none opacity-50"></div>
                                </div>
                                <span>B</span>
                                <span className="text-blue-500 italic">X</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xl text-gray-300 max-w-3xl">
                        Biz xar qanday hajmdagi biznes uchun qulay va moslashuvchan narxlarni
                        taklif qilamiz.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-300 border ${isSelected
                                    ? "bg-gradient-to-b from-blue-900/40 to-[#0a1b30] border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10"
                                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 opacity-80 hover:opacity-100"
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-full shadow-lg z-20">
                                        Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={`text-3xl font-bold mb-2 transition-colors ${isSelected ? "text-blue-400" : "text-white"}`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold whitespace-nowrap">
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="text-xl text-gray-400 font-medium">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-3 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-[16px]">
                                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "bg-gray-500"}`} />
                                            </div>
                                            <div className={`text-xl leading-snug transition-colors ${isSelected ? "text-gray-200" : "text-gray-400"}`}>
                                                {feature.text}
                                                {feature.hint && (
                                                    <p className="text-base text-gray-500 mt-0.5">
                                                        ({feature.hint})
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`mt-8 w-full py-4 text-xl rounded-xl font-semibold transition-all active:scale-95 ${isSelected
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/20"
                                        : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                        }`}>
                                    {isSelected ? "Tanlandi" : "Tanlash"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Enterprise Bottom Section */}
                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                        <p className="text-gray-400">Katta kompaniyalar va maxsus talablar uchun</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xl font-bold text-white">5 000 000 so'm / oydan</div>
                            <div className="text-sm text-gray-400">(kelishuv asosida)</div>
                        </div>
                        <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Bog'lanish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlansPage;
