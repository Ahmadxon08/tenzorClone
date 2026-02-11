import React, { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TourStep {
  id: string;
  target: string; // CSS selector или ref
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  language?: string;
}

export const Tour: React.FC<TourProps> = ({
  steps,
  isOpen,
  onClose: _onClose, // Mark as intentionally unused for now
  onComplete,
  language = "uz",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) {
        onComplete();
        return;
      }
      
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (!element) {
        // Если элемент не найден, пропускаем этот шаг
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            onComplete();
          }
        }, 100);
        return;
      }

      // Проверяем, виден ли элемент
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            onComplete();
          }
        }, 100);
        return;
      }

      const tooltipHeight = 200; // Примерная высота тултипа
      const tooltipWidth = 320; // Примерная ширина тултипа
      const spacing = 16;

      let top = 0;
      let left = 0;
      const pos = step.position || "top";

      switch (pos) {
        case "top":
          top = rect.top - tooltipHeight - spacing;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case "bottom":
          top = rect.bottom + spacing;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case "left":
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.left - tooltipWidth - spacing;
          break;
        case "right":
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.right + spacing;
          break;
      }

      // Keep tooltip within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipHeight > window.innerHeight - padding) {
        top = window.innerHeight - tooltipHeight - padding;
      }

      setPosition({ top, left });

      // Make element interactive - ensure it's above overlay
      element.style.zIndex = "9998";
      element.style.pointerEvents = "auto";
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      // Cleanup: reset z-index for all tour elements
      steps.forEach((step) => {
        const el = document.querySelector(step.target) as HTMLElement;
        if (el) {
          el.style.zIndex = "";
          el.style.pointerEvents = "";
        }
      });
    };
  }, [currentStep, isOpen, steps, onComplete]);

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    _onClose();
    onComplete();
  };

  return (
    <>
      {/* Overlay with hole for active element */}
      {(() => {
        const element = document.querySelector(step.target) as HTMLElement;
        if (!element) {
          return (
            <div
              ref={overlayRef}
              className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={handleNext}
            />
          );
        }
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          return (
            <div
              ref={overlayRef}
              className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={handleNext}
            />
          );
        }
        
        // Make element interactive by ensuring it's above overlay
        element.style.zIndex = "9998";
        element.style.pointerEvents = "auto";
        
        return (
          <>
            {/* Top overlay */}
            <div
              className="fixed z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: `${rect.top - 4}px`,
              }}
              onClick={handleNext}
            />
            {/* Bottom overlay */}
            <div
              className="fixed z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              style={{
                top: `${rect.bottom + 4}px`,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              onClick={handleNext}
            />
            {/* Left overlay */}
            <div
              className="fixed z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              style={{
                top: `${rect.top - 4}px`,
                left: 0,
                width: `${rect.left - 4}px`,
                height: `${rect.height + 8}px`,
              }}
              onClick={handleNext}
            />
            {/* Right overlay */}
            <div
              className="fixed z-[9997] bg-black/60 backdrop-blur-sm pointer-events-auto"
              style={{
                top: `${rect.top - 4}px`,
                left: `${rect.right + 4}px`,
                right: 0,
                height: `${rect.height + 8}px`,
              }}
              onClick={handleNext}
            />
            {/* Highlight border */}
            <div
              className="fixed z-[9998] border-2 border-blue-500 rounded-lg pointer-events-none animate-in fade-in duration-200"
              style={{
                top: `${rect.top - 4}px`,
                left: `${rect.left - 4}px`,
                width: `${rect.width + 8}px`,
                height: `${rect.height + 8}px`,
              }}
            />
          </>
        );
      })()}

      {/* Tooltip */}
      {position && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-80 bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-blue-500/50 rounded-2xl shadow-2xl p-6 pointer-events-auto animate-in fade-in zoom-in duration-300"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{step.content}</p>
            </div>
            <button
              onClick={handleSkip}
              className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {language === "uz" ? "Oldingi" : language === "ru" ? "Назад" : "Previous"}
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
              >
                {isLast
                  ? language === "uz"
                    ? "Tugatish"
                    : language === "ru"
                    ? "Завершить"
                    : "Finish"
                  : language === "uz"
                  ? "Keyingi"
                  : language === "ru"
                  ? "Далее"
                  : "Next"}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
