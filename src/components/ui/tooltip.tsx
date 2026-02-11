import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  delay = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setPosition({ top, left });
    }
  }, [isVisible, side]);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setPosition(null);
  };

  const handleMouseEnter = showTooltip;
  const handleMouseLeave = hideTooltip;
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = () => {
    showTooltip();
    // Hide after 3 seconds on touch
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = setTimeout(() => {
      hideTooltip();
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[10000] px-3 py-1.5 text-xs font-medium text-white bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 pointer-events-none transition-opacity duration-200",
            isVisible ? "opacity-100" : "opacity-0",
            className
          )}
          style={
            position
              ? {
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                }
              : { visibility: "hidden" }
          }
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-black/90 border border-white/10 rotate-45",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2 border-l-0 border-b-0",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2 border-r-0 border-t-0"
            )}
          />
        </div>
      )}
    </>
  );
};
