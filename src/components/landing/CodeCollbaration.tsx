import { useEffect, useState } from 'react';

const CodeCollaborationSection = () => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        return () => {
            const scripts = document.querySelectorAll('script[src*="jobx.uz"], script:not([src])');
            scripts.forEach(script => {
                if (script.innerHTML.includes('window.WIDGET')) {
                    script.remove();
                }
            });
            const widget = document.querySelector('[data-widget="jobx"]');
            if (widget) {
                widget.remove();
            }
        };
    }, []);
    

    const handleCopy = () => {
        const codeText = `<script src="https://jobx.uz/widget-loader.js"></script>
<script>
  window.WIDGET = window.CSW && window.CSW.create({
    widgetUrl: "https://my.jobx.uz/widget.html",
    theme: "#0ea5e9",
    width: "420px",
    height: "620px",
    position: "right",
    siteName: "YOUR_SITE_NAME",
    publicKey: "YOUR_PUBLIC_KEY",
    bntColor: "",
    textColor: "#fff"
  });
</script>`;
        navigator.clipboard.writeText(codeText);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 10000);
    };

    return (
        <div className="max-w-6xl mx-auto mb-10 px-4  ">
            <div className="bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Vidjetni tizimga ulash</h3>
                        <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                            JOBX HR chatbotini saytingizga o‘rnatish juda oddiy.
                            Quyidagi kodni nusxalab, <code className="text-cyan-400">&lt;index.html/&gt;</code> qismiga qo‘shing.
                            Har bir kompaniya uchun beriladigan <span className="text-cyan-400 font-semibold">publicKey</span> orqali
                            sizning saytingizga moslangan widget avtomatik ishga tushadi.
                            Hech qanday qo‘shimcha sozlamalarsiz HR jarayonlarini tez va samarali yo‘lga qo‘ying.
                        </p>
                    </div>
                    <div className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden w-full">
                        <div className="bg-gray-800/50 border-b border-gray-700/50 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="flex space-x-1 sm:space-x-1.5">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-white/70 text-xs sm:text-sm">index.html</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="bg-gray-700/50 hover:bg-gray-600/70 text-white/70 hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 cursor-pointer"
                            >
                                {isCopied ? (
                                    <>
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Kod nusxalandi</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span>Kodni nusxalash</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-3 sm:p-4 font-mono text-[10px] sm:text-[12px] overflow-x-auto">
                            <div className="space-y-0.5 sm:space-y-1">
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">1</span>
                                    <span className="text-gray-400">&lt;</span>
                                    <span className="text-red-400">script</span>
                                    <span className="text-blue-400 ml-1">src</span>
                                    <span className="text-white">=</span>
                                    <span className="text-green-400">"https://jobx.uz/widget-loader.js"</span>
                                    <span className="text-gray-400">&gt;&lt;/</span>
                                    <span className="text-red-400">script</span>
                                    <span className="text-gray-400">&gt;</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">2</span>
                                    <span className="text-gray-400">&lt;</span>
                                    <span className="text-red-400">script</span>
                                    <span className="text-gray-400">&gt;</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">3</span>
                                    <span className="text-white ml-2">window.WIDGET =</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">4</span>
                                    <span className="text-white ml-4">window.CSW &&</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">5</span>
                                    <span className="text-white ml-4">window.CSW.</span>
                                    <span className="text-blue-400">create</span>
                                    <span className="text-white">({"{"}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">6</span>
                                    <span className="text-blue-400 ml-6">widgetUrl</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"https://jobx.uz/widget.html"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">7</span>
                                    <span className="text-blue-400 ml-6">theme</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"#0ea5e9"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">8</span>
                                    <span className="text-blue-400 ml-6">width</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"420px"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">9</span>
                                    <span className="text-blue-400 ml-6">height</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"620px"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">10</span>
                                    <span className="text-blue-400 ml-6">position</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"right"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">11</span>
                                    <span className="text-blue-400 ml-6">siteName</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"YOUR_SITE_NAME"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">12</span>
                                    <span className="text-blue-400 ml-6">publicKey</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"YOUR_PUBLIC_KEY"</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">13</span>
                                    <span className="text-blue-400 ml-6">bntColor</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">""</span>
                                    <span className="text-white">,</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">14</span>
                                    <span className="text-blue-400 ml-6">textColor</span>
                                    <span className="text-white">:</span>
                                    <span className="text-green-400 ml-1">"#fff"</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">15</span>
                                    <span className="text-white ml-4">{"});"}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-5 sm:w-6 text-right mr-2 sm:mr-3 select-none">16</span>
                                    <span className="text-gray-400">&lt;/</span>
                                    <span className="text-red-400">script</span>
                                    <span className="text-gray-400">&gt;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeCollaborationSection;
