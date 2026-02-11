import React, { useEffect, useState, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { X } from "lucide-react";

const questions = [
  { text: "Tell me about yourself." },
  { text: "Why do you want this job?" },
  { text: "What are your strengths?" },
  { text: "What are your weaknesses?" },
];

const ChatAI: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiTalking, setAiTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const [fade, setFade] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [aiIdle, setAiIdle] = useState(true);


  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const shouldBeListeningRef = useRef(false);


  // Timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize speech recognition
useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recog = new SpeechRecognition();
  recog.lang = "en-US";
  recog.continuous = false; // IMPORTANT !!
  recog.interimResults = false;

  recog.onstart = () => setListening(true);

  recog.onresult = () => {
  setListening(false);
  nextQuestion(); // darhol kelasi savolga o'tadi
};


  // ❗ MOST IMPORTANT FIX
  recog.onend = () => {
  setListening(false);
};


  recognitionRef.current = recog;
}, []);



const toggleListening = () => {
  if (!recognitionRef.current) return;

  if (listening) {
    recognitionRef.current.stop();
    setAiIdle(true);   // mic o‘chdi → idle mode
  } else {
    recognitionRef.current.start();
    setAiIdle(true);   // mic yoqildi → idle animatsiya ON
  }
};



const speak = (text: string, callback?: () => void) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  // AI gapira boshladi → animatsiya katta holatda bo'ladi
  setAiTalking(true);
  setListening(false);

  utterance.onend = () => {
    setAiTalking(false);
    
    // Gapirib bo'ldi → animatsiya KICHIK holatda davom etadi
    setListening(true);

    // Mic avtomatik qayta yoqilishi kerak bo'lsa
    if (shouldBeListeningRef.current && recognitionRef.current) {
      recognitionRef.current.start();
    }

    if (callback) callback();
  };

  window.speechSynthesis.speak(utterance);
};



  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setFade(false);
      setTimeout(() => {
        const next = currentQuestion + 1;
        setCurrentQuestion(next);
        setFade(true);
        speak(questions[next].text);
      }, 1000);
    }
  };

  const formatMMSS = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className="grid place-items-center h-screen text-white relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 20%, #0a1630, #071021 60%, #050c1a 100%)",
      }}
    >
      {/* Timer */}
      <div className="absolute top-4 right-4 text-lg font-mono opacity-80">
        ⏱ {formatMMSS(elapsed)}
      </div>

      <div className="flex flex-col items-center justify-center space-y-14 h-full">
        {/* AI animation */}
        <div
  className={`
    transition-all duration-[2500ms]
    ${aiTalking
      ? "scale-[2] drop-shadow-[0_0_80px_rgba(120,200,255,0.9)]"
      : "scale-75 drop-shadow-[0_0_20px_rgba(120,200,255,0.25)]"
    }
  `}
>
  <DotLottieReact
    key={aiTalking ? "ai-talking" : "ai-idle"}
    src="https://lottie.host/93c33a75-9e76-4893-ad96-d61397d1fbfd/a1wE781ZJ2.lottie"
    loop={true}
    speed={aiTalking ? 1 : 0.6}
    autoplay={true}
    style={{
      width: aiTalking ? 280 : 160,
      height: aiTalking ? 280 : 160,
      opacity: aiIdle ? 0.85 : 1,  
    }}
  />
</div>


        {/* Question */}
        <div
          key={currentQuestion}
          className={`text-3xl text-center font-semibold transition-opacity duration-[1600ms] ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "#d6e6ff",
            textShadow: "0 0 15px rgba(120,180,255,0.5)",
          }}
        >
          {questions[currentQuestion].text}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-10 mt-4">
          {/* Mic */}
          <button
            onClick={toggleListening}
            className="rounded-full transition-all"
            style={{ backgroundColor: "transparent", outline: "none", border: "none" }}
          >
            <DotLottieReact
              key={listening ? "mic-on" : "mic-off"}
              src="https://lottie.host/8c62bf0a-8c23-4fa1-9490-5d3ae3d16aeb/L530GP2AJq.lottie"
              loop={listening}
              autoplay={listening}
              style={{ width: 95, height: 95 }}
            />
          </button>

          {/* Exit */}
          <button
            onClick={() => window.location.reload()}
            className="rounded-full p-4 text-white hover:text-red-400 transition-all"
          >
            <X size={36} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
