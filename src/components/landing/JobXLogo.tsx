
import React from "react";

const JobXLogo: React.FC = () => {
    return (
        <div className="flex items-center justify-center">
            <h1 className="text-5xl md:text-9xl font-bold text-white mb-6 leading-tight select-none">
                <span className="mr-4">JOB</span>
                <span className="relative inline-block w-28 h-28 md:w-36 md:h-36 -mt-2 md:-mt-4">
                    <div className="absolute inset-0 transform-gpu will-change-transform animate-tilt3d">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <span
                                key={i}
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    transform: `translate3d(${(i + 1) * 2}px, ${(i + 1) * 1.6}px, 0) rotate(-22.5deg)`,
                                    filter: `brightness(${1 - i * 0.05})`,
                                    zIndex: 1 + i,
                                }}
                            >
                                <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                                    <g transform="translate(50 50) rotate(0)">
                                        <path
                                            d="M-30 -40 L 30 40 L 10 40 L -30 -10 L -50 10 L -10 40 L -30 40 z"
                                            fill="#0ea5e9"
                                            transform="rotate(22.5)"
                                        />
                                    </g>
                                </svg>
                            </span>
                        ))}
                        <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{ zIndex: 999 }}
                        >
                            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                                <defs>
                                    <linearGradient id="jobx-front" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="60%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                    <linearGradient id="jobx-spec" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                                        <stop offset="30%" stopColor="rgba(255,255,255,0.08)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>

                                    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feBlend in="SourceGraphic" in2="blur" mode="normal" />
                                    </filter>
                                </defs>
                                <g transform="translate(50 50) rotate(0)">
                                    <path
                                        d="M-30 -40 L 30 40 L 10 40 L -30 -10 L -50 10 L -10 40 L -30 40 z"
                                        fill="rgba(0,0,0,0.28)"
                                        transform="rotate(22.5) translate(6,6)"
                                        opacity="0.25"
                                    />
                                    <path
                                        d="M-30 -40 L 30 40 L 10 40 L -30 -10 L -50 10 L -10 40 L -30 40 z"
                                        fill="url(#jobx-front)"
                                        transform="rotate(22.5)"
                                        style={{ transition: "transform 400ms ease" }}
                                    />
                                    <path
                                        d="M-30 -40 L 30 40 L 10 40 L -30 -10 L -50 10 L -10 40 L -30 40 z"
                                        fill="url(#jobx-spec)"
                                        transform="rotate(22.5)"
                                        style={{ mixBlendMode: "screen", opacity: 0.9 }}
                                        className="jobx-shine"
                                    />
                                    <path
                                        d="M-30 -40 L 30 40 L 10 40 L -30 -10 L -50 10 L -10 40 L -30 40 z"
                                        transform="rotate(22.5)"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.08)"
                                        strokeWidth="1"
                                    />
                                </g>
                            </svg>
                        </span>
                    </div>
                    <span className="absolute inset-0 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                                <radialGradient id="glow" cx="30%" cy="20%" r="60%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </radialGradient>
                            </defs>
                            <rect x="0" y="0" width="100" height="100" fill="url(#glow)" className="animate-glow" />
                        </svg>
                    </span>
                </span>
            </h1>

            <style
                //@ts-ignore
                jsx>{`
        /* 3D tilt animation: slow gentle rotation around Y and X */
        @keyframes tilt {
          0% { transform: rotateX(2deg) rotateY(-8deg) translateZ(0); }
          50% { transform: rotateX(3deg) rotateY(8deg) translateZ(0); }
          100% { transform: rotateX(2deg) rotateY(-8deg) translateZ(0); }
        }
        .animate-tilt3d {
          animation: tilt 6s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 800px;
        }

        /* moving glossy highlight sweep */
        @keyframes shine {
          0% { transform: translateX(-140%) skewX(-20deg); opacity: 0; }
          10% { opacity: 0.7; }
          50% { transform: translateX(40%) skewX(-20deg); opacity: 0.25; }
          90% { opacity: 0.7; }
          100% { transform: translateX(140%) skewX(-20deg); opacity: 0; }
        }
        .jobx-shine {
          animation: shine 4.8s linear infinite;
          transform-origin: center;
          mix-blend-mode: screen;
          filter: blur(6px) saturate(1.1);
        }

        /* subtle pulsing ambient glow */
        @keyframes glow {
          0% { opacity: 0.06; transform: scale(1); }
          50% { opacity: 0.12; transform: scale(1.02); }
          100% { opacity: 0.06; transform: scale(1); }
        }
        .animate-glow {
          animation: glow 5s ease-in-out infinite;
        }

        /* responsive tweaks for size */
        @media (max-width: 768px) {
          .animate-tilt3d { animation-duration: 7s; }
          .jobx-shine { animation-duration: 5.6s; }
        }

        /* preference: reduce motion respects user settings */
        @media (prefers-reduced-motion: reduce) {
          .animate-tilt3d, .jobx-shine, .animate-glow { animation: none !important; }
        }
      `}</style>
        </div>
    );
};

export default JobXLogo;
