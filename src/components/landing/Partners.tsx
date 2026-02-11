

import { useState } from "react"

const Partners = () => {
  const [isPaused, setIsPaused] = useState(false)
  const companies = [
    { name: "Finco", logo: "Finco" },
    { name: "Payme", logo: "Payme" },
    { name: "Click", logo: "Click" },
    { name: "Artel", logo: "Artel" },
    { name: "UzAuto", logo: "UzAuto" },
    { name: "Beeline", logo: "Beeline" },
    { name: "Ucell", logo: "Ucell" },
    { name: "Huawei", logo: "Huawei" },
    { name: "Korzinka", logo: "Korzinka" },
    { name: "MyTaxi", logo: "MyTaxi" },
    { name: "SkyEng", logo: "SkyEng" },
    { name: "Epam", logo: "Epam" },
  ]
  const duplicatedCompanies = [...companies, ...companies]
  return (
    <div className="py-16  mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-white/90 text-xl md:text-2xl font-semibold mb-4 tracking-wide">
          Ishonch bildirgan kompaniyalar
        </h2>
        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-6">
          100+ kompaniya JOB X orqali nomzodlarni tezkor va samarali tanlamoqda
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div
          className={`flex space-x-8 md:space-x-12 lg:space-x-16 ${isPaused ? "pause-animation" : "animate-scroll"}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            width: `${duplicatedCompanies.length * 200}px`,
          }}
        >
          {duplicatedCompanies.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="group flex-shrink-0 flex items-center justify-center h-16 md:h-20 px-6 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
              style={{ minWidth: "180px" }}
            >
              <span className="text-white/80 group-hover:text-white font-semibold text-base md:text-lg lg:text-xl whitespace-nowrap transition-colors duration-300">
                {company.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style
        // @ts-ignore
        jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${companies.length * 200}px);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${companies.length * 160}px);
            }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
        }
      `}</style>
    </div>
  )
}

export default Partners
