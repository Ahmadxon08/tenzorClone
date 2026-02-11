import { useEffect, useMemo, useState } from "react";
import { TimeCard } from "../../pages/Dashboard/Test/ChatInterviewForUser";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";


type ServerCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const toTotalSeconds = (t: ServerCountdown) =>
  t.days * 24 * 3600 + t.hours * 3600 + t.minutes * 60 + t.seconds;

const formatDHMS = (totalSeconds: number) => {
  const clamped = Math.max(0, totalSeconds);

  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
};

export function MainCounter({ serverTime }: { serverTime: ServerCountdown }) {
  const { t } = useTranslation();
  const initialSeconds = useMemo(() => toTotalSeconds(serverTime), [serverTime]);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
  }, [initialSeconds]);
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [remainingSeconds]);
  const translated = formatDHMS(remainingSeconds);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-transparent backdrop-blur-2xl transition-all duration-500 font-sans">
      <div className="flex min-h-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl text-center space-y-12 animate-in fade-in zoom-in duration-300">
          {remainingSeconds > 0 ? (
            <>
              <div className="space-y-2">
                <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                  {t('waitPage.hello')}
                </h2>
                <p className="text-3xl md:text-4xl text-white font-semibold">
                  {t('waitPage.timeLeft')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-3 md:gap-6">
                <TimeCard value={translated.days} label={`${t('waitPage.days')}`} />
                <span className="hidden sm:block text-5xl font-bold text-white/50 self-start mt-4">:</span>

                <TimeCard value={translated.hours} label={`${t('waitPage.hours')}`} />
                <span className="hidden sm:block text-5xl font-bold text-white/50 self-start mt-4">:</span>

                <TimeCard value={translated.minutes} label={`${t('waitPage.minutes')}`} />
                <span className="hidden sm:block text-5xl font-bold text-white/50 self-start mt-4">:</span>

                <TimeCard value={translated.seconds} label={`${t('waitPage.seconds')}`} />
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <p className="text-xl font-medium text-white/90">
                  {t('waitPage.beforeStart')}
                </p>
                <p className="text-lg text-white/80 leading-snug italic">
                  {t('waitPage.meanwhile')}
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-4">
                <h2 className="text-6xl md:text-7xl font-bold text-white tracking-tighter">
                   Vaqt Keldi!
                </h2>
                <p className="text-2xl md:text-3xl text-white/90 font-medium">
                  {t('waitPage.ready')}
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-[#7a97ff] rounded-2xl font-bold text-xl shadow-[0_10px_0_0_#5c7ae6] hover:shadow-[0_5px_0_0_#5c7ae6] hover:translate-y-[5px] transition-all active:shadow-none active:translate-y-[10px]"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                {t('waitPage.refresh')}
              </button>

            </div>
          )}


          <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-12 pt-8 pointer-events-none opacity-40">
            <div className="hidden md:block">
              <div className="h-32 w-32 border-t-4 border-l-4 border-white rounded-tl-3xl" />
            </div>
            <div className="hidden md:block">
              <div className="h-40 w-24 border-t-4 border-r-4 border-white rounded-tr-3xl" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-12 pb-8 pointer-events-none opacity-40">
            <div className="hidden md:block">
              <div className="h-32 w-32 border-b-4 border-l-4 border-white rounded-bl-3xl" />
            </div>
            <div className="hidden md:block">
              <div className="h-40 w-24 border-b-4 border-r-4 border-white rounded-br-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainCounter;