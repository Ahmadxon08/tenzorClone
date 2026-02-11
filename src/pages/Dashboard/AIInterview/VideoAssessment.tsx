"use client";
import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  FileText,
  Upload,
  Phone,
  User,
  X,
  Mail,
  MapPin,
  Camera,
  Mic,
  Monitor,
  AlertTriangle,
  Globe,
  PhoneOff,
  Send,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../../../services/api";
import * as faceapi from "face-api.js";
import InterviewResultModal from "../../../components/dashboard/InterviewResultModal";
import MainCounter from "../../../components/ui/counters";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../../components/ui/tooltip";
import { Tour } from "../../../components/ui/tour";


const VideoAssessment = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"gate" | "interview">("gate");

  useEffect(() => {
    i18n.changeLanguage('uz');
    setLanguage('uz');
  }, []);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionFound, setSessionFound] = useState(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);


  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(20).fill(0)
  );
  const [proctoringError, setProctoringError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [tooEarly, updateEarliness] = useState<boolean | object>(false);

  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+998");
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("uz");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // New refs for full session video recording
  const fullSessionRecorderRef = useRef<MediaRecorder | null>(null);
  const fullSessionChunksRef = useRef<Blob[]>([]);
  const fullSessionStartRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const sessionDataRef = useRef<any>(null);
  const isInterviewActiveRef = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  // Audio mixing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);

  const [completionData, setCompletionData] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const lastSpeechTimeRef = useRef<number>(Date.now());
  const isUserSpeakingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCheatTimeRef = useRef<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [cheatCount, setCheatCount] = useState(0);
  useEffect(() => {
    if (sessionFound && candidateName && modelsLoaded && !isInterviewActiveRef.current) {
      // Attempt to auto-start
      // Note: Browsers may block getUserMedia without user interaction.
      // We will try. If it fails, user will see the "Welcome" screen (because isCheckingSession will eventually be false if we handle it right, or we keep it true?)
      // actually, better UX: keep isCheckingSession = true while we try to start.
      // If handleStartInterview succeeds, state changes to 'interview'.
      // If it fails (caught in handleStartInterview -> setError), we should probably let the user click "Start".

      // We need a slight delay or ensure this runs only once
      const timer = setTimeout(() => {
        handleStartInterview().catch(e => {
          console.error("Auto-start failed", e);
          setIsCheckingSession(false); // Show the manual start button
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionFound, modelsLoaded]);

  useEffect(() => {
    // Removed automatic interview termination on cheating detection
    // Cheating alerts will only show warnings without stopping the interview
  }, [cheatCount]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("AI Proctoring tizimi tayyor ✅");
      } catch (err) {
        console.error("AI modellarni yuklashda xatolik:", err);
        setError("AI modellarini yuklab bo'lmadi. Sahifani yangilang.");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (proctoringError) {
      const timer = setTimeout(() => {
        setProctoringError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [proctoringError]);

  const reportCheating = async (cheat_name: string, reason: string) => {
    if (!isInterviewActiveRef.current) return;

    const now = Date.now();
    if (now - lastCheatTimeRef.current < 3000) return;
    lastCheatTimeRef.current = now;

    setCheatCount((prev) => prev + 1);

    const sid = sessionDataRef.current?.session_id || sessionDataRef.current?.data?.session_id;
    if (!sid) return;

    try {
      const res = await apiService.checkCheating(sid, cheat_name, reason);
      if (!isInterviewActiveRef.current) return;
      if (res && res.audio_base64) {
        const mime = res.audio_mime || "audio/wav";
        const src = `data:${mime};base64,${res.audio_base64}`;
        const audio = new Audio(src);
        currentAudioRef.current = audio;
        audio.play().catch(err => console.error("Audio playback failed:", err));
      }
    } catch (e) {
      console.error("Failed to report cheating", e);
    }
  };
// const startRecording = () => {
//   if (!mediaRecorderRef.current) return;
//   if (mediaRecorderRef.current.state === "recording") return;

//   audioChunksRef.current = [];
//   mediaRecorderRef.current.start();
//   setIsRecording(true);
//   console.log("🎙️ Recording started");
// };  
// const stopRecordingAndSend = () => {
//   if (!mediaRecorderRef.current) return;
//   if (mediaRecorderRef.current.state !== "recording") return;

//   mediaRecorderRef.current.stop();
//   setIsRecording(false);
//   console.log("📤 Recording stopped & sending");
// };
const handleMicButton = () => {
  if (!isInterviewActiveRef.current) return;
  if (isAiSpeakingRef.current) return;
  if (isProcessing) return;

  const mr = mediaRecorderRef.current;
  if (!mr) return;

  if (!isRecording) {
    // ▶️ START RECORDING
    console.log('START RECORDING',mr.state)
    if (mr.state !== "inactive") return;
   
    audioChunksRef.current = [];
    mr.start();
    setIsRecording(true);

    console.log("🎙️ Recording started");
  } else {
    // ⏹️ STOP + AUTO SEND
    if (mr.state === "recording") {
      console.log('mr recording')
      mr.stop(); // onstop ichida yuboriladi
      setIsRecording(false);

      console.log("📤 Recording stopped & sent");
    }
  }
};


  const runProctoring = async () => {
    if (
      videoRef.current &&
      isInterviewActiveRef.current
    ) {
      try {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.5,
            })
          )
          .withFaceLandmarks();

        if (detections.length === 0) {
          setProctoringError("Kameraga qarang! Yuz aniqlanmadi.");
          return;
        }

        if (detections.length > 1) {
          setProctoringError("Kadrda 1 tadan ortiq shaxs aniqlandi. Faqat o'zingiz bo'lishingiz kerak!");
          return;
        }

        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose()[0];
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[0];

        const eyeDist = rightEye.x - leftEye.x;
        const noseOffset = nose.x - leftEye.x;
        const ratio = noseOffset / eyeDist;

        if (ratio < 0.20 || ratio > 0.80) {
          setProctoringError("Yuzingizni to'g'ri tuting.");
          reportCheating("looking_away", "Yuzingizni to'g'ri tuting (bosh burildi).");
          return;
        }

        const avgEyeY = (leftEye.y + rightEye.y) / 2;
        const verticalDiff = nose.y - avgEyeY;
        const faceWidth = Math.abs(eyeDist);
        if (verticalDiff > faceWidth * 0.6) {
          setProctoringError("Pastga qaramang (Telefondan foydalanmang)!");
          reportCheating("phone_detected", "Pastga qaramang (Telefondan foydalanmang)!");
          return;
        }

        const mouth = landmarks.getMouth();
        const topLip = mouth[14].y;
        const bottomLip = mouth[18].y;
        const mouthHeight = bottomLip - topLip;

        if (mouthHeight > 10) {
          if (isAiSpeakingRef.current) {
            setProctoringError("AI gapirayotganda gapirmang.");
            return;
          }
        }

        setProctoringError(null);
      } catch (err) {
        console.error("Proctoring error:", err);
      }
    }
  };

  const formatUzPhone = (value: string) => {
    if (value === "") return "";
    if (value === "+99") return "";

    let digits = value.replace(/\D/g, "");
    if (digits.length > 0 && !digits.startsWith("998")) {
      digits = "998" + digits;
    }

    digits = digits.slice(0, 12);
    let formatted = "+998";

    if (digits.length > 3) formatted += " " + digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);

    return formatted;
  };

  const playDing = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio cue failed", e);
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if (!text || text.toUpperCase().includes("SUHBAT_TUGADI")) return;
    isAiSpeakingRef.current = true;

    const cleanText = text.replace(/\n/g, " ").replace(/[`*#]/g, "");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    let langCode = 'uz-UZ';
    if (language === 'ru') langCode = 'ru-RU';
    if (language === 'en') langCode = 'en-US';

    utterance.lang = langCode;
    utterance.rate = 0.9;

    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };
  const startVisualizer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (isInterviewActiveRef.current) {
        analyser.getByteFrequencyData(dataArray);

        const normalized = Array.from(dataArray).map((v) => v / 255);
        setAudioLevels(normalized);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        if (avg > 35) {
          lastSpeechTimeRef.current = Date.now();
          isUserSpeakingRef.current = true;
        }

      

        animationRef.current = requestAnimationFrame(update);
      }
    };
    update();
  };

  // const startRecordingCycle = () => {
  //   if (!isInterviewActiveRef.current) return;
  //   if (isAiSpeakingRef.current) return;

  //   if (
  //     !mediaRecorderRef.current ||
  //     mediaRecorderRef.current.state !== "inactive"
  //   )
  //     return;

  //   audioChunksRef.current = [];
  //   if (!mediaRecorderRef.current.stream.active) {
  //     isInterviewActiveRef.current = false;
  //     return;
  //   }

  //   try {
  //     mediaRecorderRef.current.start();
  //     recordingStartTimeRef.current = Date.now();
  //     lastSpeechTimeRef.current = Date.now();
  //     isUserSpeakingRef.current = false;
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

const handleAudioData = async (audioBlob: Blob) => {
  if (!isInterviewActiveRef.current) return;

  const sid = sessionDataRef.current?.data?.session_id;
  if (!sid || audioBlob.size < 100) return;

  try {
    setIsProcessing(true);

    const response = await apiService.sendVoice(sid, audioBlob, language);

    setIsProcessing(false);

      if (response && response.text) {
        const standardizedText = response.text.trim().toUpperCase();
        // Global check for termination signal
        if (standardizedText.includes("SUHBAT_TUGADI")) {
          setAiMessage(response.text);
          setIsInterviewFinished(true);
          stopInterview();

          try {
            const currentSid = sessionDataRef.current?.session_id || sessionDataRef.current?.data?.session_id || sessionId;
            if (currentSid) {
              const res = await apiService.completeSession(currentSid);
              if (res?.analysis) {
                setCompletionData(res.analysis);
                setIsResultModalOpen(true);
              }
            }
          } catch (e) {
            console.error("Failed to complete session", e);
          }
          return;
        }
      }

      if (response && response.audio_base64) {
        if (!isInterviewActiveRef.current) return;
        const mime = response.audio_mime || "audio/wav";
        const base64 = response.audio_base64;
        const audioSrc = `data:${mime};base64,${base64}`;
        const audio = new Audio(audioSrc);
        currentAudioRef.current = audio;

        if (response.text) {
          setAiMessage(response.text);
        } else {
          setAiMessage("AI gapirmoqda...");
        }
        isAiSpeakingRef.current = true;

        audio.onended = () => {
          isAiSpeakingRef.current = false;
          playDing();
        };

        audio.onerror = () => {
          isAiSpeakingRef.current = false;
        };

        await audio.play();
        return;
      }

      // Fallback for text-only response (non-terminating)
      if (response && response.text) {
        setAiMessage(response.text);
        if (!isInterviewActiveRef.current) return;
        speak(response.text, () => {
          playDing();
        });
      } else {
        // if (isInterviewActiveRef.current && !isAiSpeakingRef.current) {
        //   setTimeout(startRecordingCycle, 500);
        // }
      }
     } catch (e) {
    setIsProcessing(false);
  }
  };

  const handleStartInterview = async () => {
    let currentSessionId = sessionId;

    if (token && !currentSessionId) {
      try {
        const data = await apiService.getTestInviteVideo(token);
        if (data && (typeof data === 'object') && Object.keys(data).includes('detail')) {
          const soFar = data.detail;
          if (typeof soFar === 'object') {
            const reamining = soFar.remaining;
            updateEarliness(reamining);
            return;
          }
        }
        if (data?.session_id) {
          currentSessionId = data.session_id;
          setSessionId(data.session_id);
        }
      } catch (err) {
        setError("Suhbat vaqti tugadi!");
        return;
      }
    }
    if (!candidateName || !phoneNumber || !email || !address) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      if (!sessionFound) {
        // Only create/update session if it wasn't already found/existing
        try {
          await apiService.createSession({
            name: candidateName,
            phone: phoneNumber,
            email: email,
            address,
            session_id: currentSessionId,
            resume: resumeFile,
          });
        } catch (apiErr) {
          console.error("API Error during session setup:", apiErr);
          setError("Sessiyani boshlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
          setIsBusy(false);
          return;
        }
      }

      try {
        // Always join session
        const session = await apiService.joinSession({
          session_id: currentSessionId,
          candidate_name: candidateName,
          language: language,
        });

        sessionDataRef.current = session;
        isInterviewActiveRef.current = true;
      } catch (apiErr) {
        console.error("API Error during session join:", apiErr);
        setError("Sessiyaga ulanishda xatolik. Qayta urinib ko'ring.");
        setIsBusy(false);
        return;
      }

      let stream: MediaStream | undefined;
      let combinedAudioStream: MediaStream | undefined;
      
      try {
        // Get user media (camera + microphone)
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        stream = userStream;
        micStreamRef.current = new MediaStream(userStream.getAudioTracks());

        // Create AudioContext for mixing audio streams
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        
        // Create destination for mixed audio
        const destination = audioContext.createMediaStreamDestination();
        
        // Connect microphone to destination
        const micSource = audioContext.createMediaStreamSource(micStreamRef.current);
        const micGain = audioContext.createGain();
        micGain.gain.value = 1.0; // Microphone volume
        micSource.connect(micGain);
        micGain.connect(destination);

        // Try to get system audio (screen audio) if available
        let hasSystemAudio = false;
        try {
          // Request screen capture with audio for system sound
          // Note: Some browsers require video: true even if we only need audio
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1 },
              height: { ideal: 1 },
              frameRate: { ideal: 1 }
            }, // Minimal video to reduce resource usage
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            } as any,
          });
          
          // Stop video tracks immediately as we only need audio
          displayStream.getVideoTracks().forEach((track) => {
            track.stop();
          });

          // Get audio tracks from screen capture
          const systemAudioTracks = displayStream.getAudioTracks();
          if (systemAudioTracks.length > 0) {
            // Create a stream from system audio tracks
            const systemAudioStream = new MediaStream(systemAudioTracks);
            
            // Connect system audio to the mixer
            const systemSource = audioContext.createMediaStreamSource(systemAudioStream);
            const systemGain = audioContext.createGain();
            systemGain.gain.value = 1.0; // System audio volume
            systemSource.connect(systemGain);
            systemGain.connect(destination);
            
            screenStreamRef.current = displayStream;
            hasSystemAudio = true;
            console.log("✅ System audio capture enabled - both mic and computer audio will be recorded");
            
            // Handle when user stops sharing screen audio
            systemAudioTracks.forEach((track) => {
              track.onended = () => {
                console.log("Screen audio sharing ended");
                screenStreamRef.current = null;
              };
            });
          }
        } catch (screenErr) {
          // System audio capture not available or denied - continue without it
          console.log("ℹ️ System audio capture not available (optional):", screenErr);
          console.log("Recording will continue with microphone only");
        }

        // Get the combined audio stream from the destination
        combinedAudioStream = destination.stream;
        combinedStreamRef.current = combinedAudioStream;
        
        console.log(`🎤 Audio setup complete: Microphone ${hasSystemAudio ? '+ System Audio' : 'only'}`);
        
      } catch (mediaErr) {
        console.error("Media Device Error:", mediaErr);
        setError("Kamera yoki mikrofonga ruxsat berilmadi yoki qurilma topilmadi.");
        setIsBusy(false);
        return;
      }

      if (!stream) {
        setError("Media stream olinmadi.");
        setIsBusy(false);
        return;
      }

      // Use microphone stream for visualizer (shows user's voice levels)
      if (micStreamRef.current) {
        startVisualizer(micStreamRef.current);
      } else {
        startVisualizer(stream);
      }

      // Create MediaRecorder with combined audio stream (mic + system audio)
      // Use the combined audio stream for recording
      const audioStreamForRecording = combinedAudioStream || new MediaStream(stream.getAudioTracks());
      
      const mr = new MediaRecorder(audioStreamForRecording, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
        
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });

        audioChunksRef.current = [];

        // 🎯 Yozish tugadi → darhol yuboriladi
        handleAudioData(blob);
      };
      mediaRecorderRef.current = mr;

      // Create a combined stream for video recording (video + mixed audio)
      const videoStreamForRecording = new MediaStream([
        ...stream.getVideoTracks(),
        ...(combinedAudioStream ? combinedAudioStream.getAudioTracks() : stream.getAudioTracks())
      ]);

      // Start full session video recording with combined audio
      try {
        const videoMr = new MediaRecorder(videoStreamForRecording, {
          mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
            ? "video/webm;codecs=vp8,opus"
            : "video/webm"
        });

        videoMr.ondataavailable = (e) => {
          if (e.data.size > 0) {
            fullSessionChunksRef.current.push(e.data);
          }
        };

        videoMr.onstop = async () => {
          try {
            const blob = new Blob(fullSessionChunksRef.current, {
              type: videoMr.mimeType || "video/webm",
            });

            // Calculate duration if we have start timestamp
            const durationSeconds = fullSessionStartRef.current
              ? Math.round((Date.now() - fullSessionStartRef.current) / 1000)
              : undefined;

            // Try to upload video to backend if session id available
            const sid = sessionDataRef.current?.session_id || sessionDataRef.current?.data?.session_id || sessionId;
            if (sid && blob.size > 0) {
              try {
                await apiService.uploadVideo(sid, blob, durationSeconds);
                console.log("Video uploaded for session", sid);
              } catch (uploadErr) {
                console.error("Failed to upload video:", uploadErr);
              }
            } else {
              console.log("No session id available or empty video blob, skipping upload.");
            }
          } catch (err) {
            console.error("Error processing recorded video:", err);
          } finally {
            // clear chunks and reset start time
            fullSessionChunksRef.current = [];
            fullSessionStartRef.current = null;
          }
        };

        // Start recording
        fullSessionStartRef.current = Date.now();
        videoMr.start(1000); // Collect chunks every second
        fullSessionRecorderRef.current = videoMr;
        fullSessionChunksRef.current = [];

      } catch (videoErr) {
        console.error("Failed to start video recording:", videoErr);
      }

      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          console.warn("Fullscreen denied:", e);
        }
      }

      setState("interview");
      proctoringIntervalRef.current = setInterval(() => {
        runProctoring();
      }, 1000);
      
      // Check if user needs to see the tour
      const hasSeenTour = localStorage.getItem("video-chat-tour-completed");
      if (!hasSeenTour) {
        // Wait for UI to fully render, then show tour
        setTimeout(() => {
          // Double check that elements are ready
          const micButton = document.querySelector("[data-tour='mic-button']");
          if (micButton) {
            setShowTour(true);
          } else {
            // Retry after a bit more time
            setTimeout(() => {
              setShowTour(true);
            }, 1000);
          }
        }, 2000);
      }
      
      setTimeout(async () => {
        if (videoRef.current) videoRef.current.srcObject = stream;

        const data = sessionDataRef.current?.data || sessionDataRef.current;

        // Show message text if available
        if (data?.initial_message) {
          setAiMessage(data.initial_message);
        }

        if (data?.initial_audio_base64) {
          try {
            const mime = data.initial_audio_mime || "audio/wav";
            const audio = new Audio(`data:${mime};base64,${data.initial_audio_base64}`);
            currentAudioRef.current = audio;
            isAiSpeakingRef.current = true;

            const onComplete = () => {
              isAiSpeakingRef.current = false;
              playDing();
              // Small delay to ensure Ding doesn't trigger "User Speaking" via echo
              
            };

            audio.onended = onComplete;
            audio.onerror = () => {
              console.error("Audio playback error");
              isAiSpeakingRef.current = false;
              // Fallback if audio fails but text exists
              if (data?.initial_message) {
                speak(data.initial_message, () => {
                  playDing();
                 
                });
              } else {
                // startRecordingCycle();
              }
            };

            await audio.play();
          } catch (e) {
            console.error("Failed to play initial audio:", e);
            isAiSpeakingRef.current = false;
            if (data?.initial_message) {
              speak(data.initial_message, () => {
                playDing();
              });
            } else {
              // startRecordingCycle();
            }
          }
        } else if (data?.initial_message) {
          // Text only fallback
          speak(data.initial_message, () => {
            playDing();
          });
        } else {
          // startRecordingCycle();
        }
      }, 500);

    } catch (err) {
      console.error("Unknown error in handleStartInterview:", err);
      setError("Noma'lum xatolik yuz berdi.");
    } finally {
      setIsBusy(false);
    }
  };

  const stopInterview = () => {
    isInterviewActiveRef.current = false;
    // Don't change local state here if unnecessary, but might be needed to switch back to gate if desired.
    // However, if we are finished, we want to show gate -> thank you, so setState('gate') might be appropriate
    // BUT we have a "finished" state now.
    setState('gate'); // Go back to gate so we can show the "Thank You" screen inside the gate view logic

    if (proctoringIntervalRef.current)
      clearInterval(proctoringIntervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }

    // Stop full session recording
    if (fullSessionRecorderRef.current?.state !== "inactive") {
      fullSessionRecorderRef.current?.stop();
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Stop screen audio stream if exists
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    
    // Stop microphone stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    
    // Stop combined audio stream
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((track) => track.stop());
      combinedStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };
  useEffect(() => {
    const loadInvite = async () => {
      setIsCheckingSession(true);
      if (!token) {
        setSessionId(`public-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        setIsCheckingSession(false);
        return;
      }

      try {
        // 1. Get session ID from token
        const inviteData = await apiService.getTestInviteVideo(token);

        if (inviteData?.status === 410) {
          setIsSessionExpired(true);
          setIsCheckingSession(false);
          return;
        }

        if (inviteData && (typeof inviteData === 'object') && Object.keys(inviteData).includes('detail')) {
          const soFar = inviteData.detail;
          if (typeof soFar === 'object') {
            const reamining = soFar.remaining;
            updateEarliness(reamining);
            setIsCheckingSession(false);
            return;
          }
        }

        if (inviteData?.session_id) {
          setSessionId(inviteData.session_id);

          // 2. Check if session data exists
          try {
            const sessionDetails = await apiService.getVideoSession(inviteData.session_id);
            if (sessionDetails?.data) {
              // Session exists, pre-fill data
              const d = sessionDetails.data;
              // Robust mapping: check different case variations or property names if backend is inconsistent
              const cName = d.candidate_name || d.name || d.full_name || "";
              const cPhone = formatUzPhone(d.candidate_phone || d.phone || "");
              const cEmail = d.candidate_email || d.email || "";
              const cAddr = d.candidate_location || d.location || d.address || "";

              // Strict check: if critical info is missing (like name or phone), we treat it as "Session not ready/found" 
              // and show the input form to let user fill it.
              if (cName && cPhone) {
                setCandidateName(cName);
                setPhoneNumber(cPhone);
                setEmail(cEmail);
                setAddress(cAddr);
                setSessionFound(true);
                setAgreeRules(true);
                // Keep isCheckingSession=true to allow auto-start effect to run
              } else {
                console.log("Session data incomplete (missing name or phone), showing form");
                setIsCheckingSession(false);
              }
            } else {
              console.log("Empty session data");
              setIsCheckingSession(false);
            }
          } catch (sessionErr) {
            // Session not found or error, just show form
            console.log("Session not found (error), showing form");
            setIsCheckingSession(false);
          }
        } else {
          // No session id in invite, show form
          setIsCheckingSession(false);
        }
      } catch (e) {
        console.error("Error loading invite:", e);
        setIsCheckingSession(false);
      }
      // Finally block removed because we conditionally set isCheckingSession inside
    };
    loadInvite();
    return () => stopInterview();
  }, [token]);

  const niceVisualizerBars = [
    ...audioLevels.slice(0, 5).reverse(),
    ...audioLevels.slice(0, 5),
  ];

  const handleFinishInterview = async () => {
    try {
      setIsBusy(true);
      stopInterview();

      if (sessionId) {
        const res = await apiService.completeSession(sessionId);
        if (res?.analysis) {
          setCompletionData(res.analysis);
          setIsResultModalOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to complete session manually", e);
      navigate("/dashboard/tests");
    } finally {
      setIsBusy(false);
    }
  };

  const getTourSteps = () => {
    const steps: Array<{
      id: string;
      target: string;
      title: string;
      content: string;
      position?: "top" | "bottom" | "left" | "right";
    }> = [
      {
        id: "welcome",
        target: "[data-tour='mic-button']",
        title:
          language === "uz"
            ? "Mikrofon tugmasi"
            : language === "ru"
            ? "Кнопка микрофона"
            : "Microphone Button",
        content:
          language === "uz"
            ? "Javob berish uchun mikrofon tugmasini bosing va gapiring. Yozish tugagach, avtomatik ravishda yuboriladi."
            : language === "ru"
            ? "Нажмите кнопку микрофона и говорите, чтобы ответить. После окончания записи ответ будет отправлен автоматически."
            : "Press the microphone button and speak to answer. After recording ends, it will be sent automatically.",
        position: "top",
      },
      {
        id: "status",
        target: "[data-tour='status-indicator']",
        title:
          language === "uz"
            ? "Holat ko'rsatkichi"
            : language === "ru"
            ? "Индикатор статуса"
            : "Status Indicator",
        content:
          language === "uz"
            ? "Bu ko'rsatkich joriy holatni ko'rsatadi: Tayyor, Yozilmoqda, Ishlanmoqda yoki AI gapirmoqda."
            : language === "ru"
            ? "Этот индикатор показывает текущий статус: Готов, Запись, Обработка или AI говорит."
            : "This indicator shows the current status: Ready, Recording, Processing, or AI speaking.",
        position: "top",
      },
      {
        id: "visualizer",
        target: "[data-tour='audio-visualizer']",
        title:
          language === "uz"
            ? "Ovoz vizualizatori"
            : language === "ru"
            ? "Визуализатор звука"
            : "Audio Visualizer",
        content:
          language === "uz"
            ? "Bu chiziqlar ovoz darajasini ko'rsatadi. Gapirganda ular ko'tariladi va tushadi."
            : language === "ru"
            ? "Эти полосы показывают уровень звука. Они поднимаются и опускаются, когда вы говорите."
            : "These bars show your audio level. They rise and fall when you speak.",
        position: "top",
      },
      {
        id: "end",
        target: "[data-tour='end-button']",
        title:
          language === "uz"
            ? "Suhbatni tugatish"
            : language === "ru"
            ? "Завершить собеседование"
            : "End Interview",
        content:
          language === "uz"
            ? "Suhbatni yakunlash uchun bu tugmani bosing. Suhbat tugagach, natijalar tahlil qilinadi."
            : language === "ru"
            ? "Нажмите эту кнопку, чтобы завершить собеседование. После завершения результаты будут проанализированы."
            : "Click this button to end the interview. After ending, results will be analyzed.",
        position: "top",
      },
    ];

    // Add AI message step if message is visible
    if (aiMessage) {
      steps.unshift({
        id: "ai-message",
        target: "[data-tour='ai-message']",
        title:
          language === "uz"
            ? "AI xabari"
            : language === "ru"
            ? "Сообщение AI"
            : "AI Message",
        content:
          language === "uz"
            ? "Bu yerda AI sizga bergan savollar va javoblar ko'rsatiladi. AI gapirganda kutib turing."
            : language === "ru"
            ? "Здесь отображаются вопросы и ответы от AI. Подождите, пока AI говорит."
            : "This shows questions and responses from AI. Wait while AI is speaking.",
        position: "bottom" as "top" | "bottom" | "left" | "right",
      });
    }

    return steps;
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("video-chat-tour-completed", "true");
  };

  return (tooEarly && typeof tooEarly === 'object') ?
    <MainCounter serverTime={tooEarly as any} />
    :
    (
      <div className="fixed inset-0 z-[9999] bg-black text-white font-sans overflow-hidden">
        {isResultModalOpen && (
          <InterviewResultModal
            isOpen={isResultModalOpen}
            onClose={() => navigate("/dashboard/tests")}
            data={completionData}
          />
        )}
        {state === "gate" ? (
          <div className="flex h-full w-full items-center justify-center p-4 relative overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#020617] to-purple-900/20" />

            {isCheckingSession ? (
              <div className="z-10 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-blue-200 text-sm animate-pulse">Ma'lumotlar tekshirilmoqda...</p>
              </div>
            ) : isSessionExpired ? (
              <div className="z-10 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                  {i18n.t("testsPage.errors.expired")}
                </h2>
              </div>
            ) : isInterviewFinished ? (
              <div className="z-10 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <FileText className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                  Suhbat Yakunlandi!
                </h2>
                <p className="text-gray-300 max-w-md text-lg leading-relaxed">
                  Ishtirokingiz uchun rahmat. Sizning natijalaringiz tahlil qilinmoqda va tez orada taqdim etiladi.
                </p>
                <button
                  onClick={() => navigate("/dashboard/tests")}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10 hover:scale-105 active:scale-95"
                >
                  Bosh sahifaga qaytish
                </button>

                {isResultModalOpen && (
                  <div className="mt-8">
                    <p className="text-sm text-blue-400 animate-pulse">Tahlil natijalari tayyor...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-full max-w-lg rounded-3xl border border-white/10 bg-[#071226]/80 backdrop-blur-xl p-8 shadow-2xl space-y-5 relative z-10 my-8 ${sessionFound ? 'border-blue-500/30 shadow-blue-900/20' : ''}`}>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {sessionFound ? `Xush kelibsiz, ${candidateName}!` : "AI Assessment"}
                  </h2>
                  <p className="text-gray-400 text-xs">
                    {sessionFound ? "Suhbatni boshlash uchun tayyormisiz?" : "Suhbatni boshlash uchun ma'lumotlaringizni kiriting"}
                  </p>
                </div>

                {!sessionFound && (
                  <>
                    <div className="grid grid-cols-3 gap-2 py-2">
                      <Tooltip
                        content={
                          language === "uz"
                            ? "Kamerangiz ishlashi kerak"
                            : language === "ru"
                            ? "Ваша камера должна работать"
                            : "Your camera needs to work"
                        }
                        side="top"
                        delay={200}
                      >
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/5 cursor-help">
                          <Camera className="w-4 h-4 text-blue-400" />
                          <span className="text-[10px] text-gray-400">
                            {language === "uz"
                              ? "Kamera"
                              : language === "ru"
                              ? "Камера"
                              : "Camera"}
                          </span>
                        </div>
                      </Tooltip>
                      <Tooltip
                        content={
                          language === "uz"
                            ? "Mikrofoningiz ishlashi kerak"
                            : language === "ru"
                            ? "Ваш микрофон должен работать"
                            : "Your microphone needs to work"
                        }
                        side="top"
                        delay={200}
                      >
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/5 cursor-help">
                          <Mic className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] text-gray-400">
                            {language === "uz"
                              ? "Mikrofon"
                              : language === "ru"
                              ? "Микрофон"
                              : "Microphone"}
                          </span>
                        </div>
                      </Tooltip>
                      <Tooltip
                        content={
                          language === "uz"
                            ? "Suhbat yozib olinadi"
                            : language === "ru"
                            ? "Собеседование записывается"
                            : "Interview is being recorded"
                        }
                        side="top"
                        delay={200}
                      >
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/5 cursor-help">
                          <Monitor className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] text-gray-400">
                            {language === "uz"
                              ? "Yozib olish"
                              : language === "ru"
                              ? "Запись"
                              : "Recording"}
                          </span>
                        </div>
                      </Tooltip>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="To'liq ismingiz *"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          placeholder="Email manzilingiz *"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          placeholder="+998 __ ___ __ __"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
                          value={phoneNumber}
                          onChange={(e) =>
                            setPhoneNumber(formatUzPhone(e.target.value))
                          }
                        />
                      </div>

                      {/* Language Selection */}
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            i18n.changeLanguage(e.target.value);
                          }}
                        >
                          <option value="uz" className="bg-[#0f172a] text-white">O'zbek tili</option>
                          <option value="ru" className="bg-[#0f172a] text-white">Русский язык</option>
                          <option value="en" className="bg-[#0f172a] text-white">English</option>
                        </select>
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Yashash manzilingiz *"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        {!resumeFile ? (
                          <label className="flex items-center gap-3 w-full p-3 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              Rezyume yuklash (ixtiyoriy)
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                setResumeFile(e.target.files?.[0] || null)
                              }
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="text-xs text-blue-100 truncate">
                                {resumeFile.name}
                              </span>
                            </div>
                            <button
                              onClick={() => setResumeFile(null)}
                              className="p-1 hover:bg-white/10 rounded-md"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 p-2 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-blue-500"
                        checked={agreeRules}
                        onChange={(e) => setAgreeRules(e.target.checked)}
                      />
                      <span className="text-[14px] text-gray-400 leading-tight">
                        Qoidalarga roziman.
                      </span>
                    </label>
                  </>
                )}

                {error && (
                  <div className="text-red-400 text-[10px] text-center bg-red-900/10 py-2 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-sm transition-colors"
                  >
                    Chiqish
                  </button>
                  <button
                    disabled={
                      !agreeRules ||
                      isBusy ||
                      (!sessionId && !token) ||
                      !candidateName ||
                      !email ||
                      !phoneNumber ||
                      !address ||
                      !modelsLoaded
                    }
                    onClick={handleStartInterview}
                    className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold disabled:opacity-30 transition-all shadow-lg active:scale-95"
                  >
                    {isBusy ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : !modelsLoaded ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI Yuklanmoqda...
                      </span>
                    ) : (
                      "Boshlash"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full animate-in fade-in duration-1000">
            {proctoringError && (
              <div className="absolute top-0 left-0 right-0 z-30 flex justify-center p-4 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center gap-3 border border-red-400/50">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold tracking-wide text-sm md:text-base">
                    {proctoringError}
                  </span>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            {aiMessage && (
              <Tooltip
                content={
                  language === "uz"
                    ? "AI sizga savol berayapti yoki javob berayapti"
                    : language === "ru"
                    ? "AI задает вам вопрос или отвечает"
                    : "AI is asking you a question or responding"
                }
                side="bottom"
                delay={500}
              >
                <div data-tour="ai-message" className="absolute top-12 left-0 right-0 flex justify-center z-10 px-6">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl max-w-3xl text-center cursor-help">
                    <p className="text-lg md:text-xl text-blue-100 font-medium leading-relaxed drop-shadow-md">
                      {aiMessage}
                    </p>
                  </div>
                </div>
              </Tooltip>
            )}

            {/* Cheat Indicator */}
            <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2">
              {cheatCount > 0 && (
                <Tooltip
                  content={
                    language === "uz"
                      ? `Ogohlantirishlar: ${cheatCount}/5. Qoidalarga rioya qiling!`
                      : language === "ru"
                      ? `Предупреждения: ${cheatCount}/5. Соблюдайте правила!`
                      : `Warnings: ${cheatCount}/5. Follow the rules!`
                  }
                  side="left"
                  delay={200}
                >
                  <div className="flex gap-1 pr-1 cursor-help">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i < (5 - cheatCount)
                          ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                          : "bg-red-500/20"
                          }`}
                      />
                    ))}
                  </div>
                </Tooltip>
              )}
            </div>

            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full max-w-[95%] md:max-w-2xl px-2 md:px-4">
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                {/* MIC BUTTON */}
                <Tooltip
                  content={
                    isRecording
                      ? language === "uz"
                        ? "Yuborish uchun bosing"
                        : language === "ru"
                        ? "Нажмите для отправки"
                        : "Click to send"
                      : language === "uz"
                      ? "Javob berish uchun mikrofonni bosib ushlab turing"
                      : language === "ru"
                      ? "Нажмите и удерживайте микрофон для ответа"
                      : "Press and hold microphone to answer"
                  }
                  side="top"
                  delay={200}
                >
                  <button
                    data-tour="mic-button"
                    onClick={handleMicButton}
                    disabled={isProcessing}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                      ${isRecording
                        ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse shadow-[0_0_16px_rgba(239,68,68,0.7)] ring-2 ring-red-400/50"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-[0_0_16px_rgba(59,130,246,0.6)] ring-2 ring-blue-400/30"
                      }`}
                  >
                    {isRecording ? (
                      <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                  </button>
                </Tooltip>

                {/* Separator - скрыт на мобильных */}
                <div className="hidden sm:block w-px h-8 bg-white/30" />

                {/* Status Indicator - скрыт на очень маленьких экранах */}
                <Tooltip
                  content={
                    isProcessing
                      ? language === "uz"
                        ? "Javobingiz qayta ishlanmoqda..."
                        : language === "ru"
                        ? "Ваш ответ обрабатывается..."
                        : "Processing your response..."
                      : isAiSpeakingRef.current
                      ? language === "uz"
                        ? "AI savol berayapti - kutib turing"
                        : language === "ru"
                        ? "AI задает вопрос - подождите"
                        : "AI is asking - please wait"
                      : isRecording
                      ? language === "uz"
                        ? "Ovozingiz yozilmoqda - gapiring"
                        : language === "ru"
                        ? "Ваш голос записывается - говорите"
                        : "Recording your voice - speak now"
                      : language === "uz"
                      ? "Javob berishga tayyor - mikrofonni bosing"
                      : language === "ru"
                      ? "Готов к ответу - нажмите микрофон"
                      : "Ready to answer - press microphone"
                  }
                  side="top"
                  delay={200}
                >
                  <div data-tour="status-indicator" className="hidden sm:flex items-center gap-2 min-w-[100px] md:min-w-[120px] cursor-help">
                    {isProcessing ? (
                      <>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                        <span className="text-xs md:text-sm font-medium text-blue-100">
                          {language === "uz"
                            ? "Ishlanmoqda..."
                            : language === "ru"
                            ? "Обработка..."
                            : "Processing..."}
                        </span>
                      </>
                    ) : isAiSpeakingRef.current ? (
                      <>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                        <span className="text-xs md:text-sm font-medium text-blue-100">
                          {language === "uz"
                            ? "AI gapirmoqda..."
                            : language === "ru"
                            ? "AI говорит..."
                            : "AI speaking..."}
                        </span>
                      </>
                    ) : isRecording ? (
                      <>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                        <span className="text-xs md:text-sm font-medium text-white">
                          {language === "uz"
                            ? "Eshitilmoqda..."
                            : language === "ru"
                            ? "Запись..."
                            : "Listening..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs md:text-sm font-medium text-gray-200">
                          {language === "uz"
                            ? "Tayyor"
                            : language === "ru"
                            ? "Готов"
                            : "Ready"}
                        </span>
                      </>
                    )}
                  </div>
                </Tooltip>

                {/* Separator - скрыт на мобильных */}
                <div className="hidden sm:block w-px h-8 bg-white/30" />

                {/* Audio Visualizer */}
                <Tooltip
                  content={
                    language === "uz"
                      ? "Ovoz darajasi - gapirganda ko'tariladi"
                      : language === "ru"
                      ? "Уровень звука - повышается при разговоре"
                      : "Audio level - increases when speaking"
                  }
                  side="top"
                  delay={200}
                >
                  <div data-tour="audio-visualizer" className="flex items-end gap-1 h-8 md:h-10 px-1 md:px-2 cursor-help">
                    {niceVisualizerBars.map((level, i) => (
                      <div
                        key={i}
                        className={`w-1 md:w-1.5 rounded-full transition-all duration-75 ${
                          level > 0.1
                            ? "bg-gradient-to-t from-blue-400 to-blue-500 shadow-[0_0_6px_rgba(96,165,250,0.6)]"
                            : "bg-white/25"
                        }`}
                        style={{
                          height: `${Math.max(3, level * 100)}%`,
                          minHeight: "3px",
                        }}
                      />
                    ))}
                  </div>
                </Tooltip>

                {/* Separator - скрыт на мобильных */}
                <div className="hidden sm:block w-px h-8 bg-white/30" />

                {/* End Button */}
                <Tooltip
                  content={
                    language === "uz"
                      ? "Suhbatni tugatish"
                      : language === "ru"
                      ? "Завершить собеседование"
                      : "End interview"
                  }
                  side="top"
                  delay={200}
                >
                  <button
                    data-tour="end-button"
                    onClick={handleFinishInterview}
                    disabled={isBusy}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 hover:border-red-500/60 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                      <PhoneOff className="w-4 h-4 md:w-5 md:h-5 rotate-90" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
        <InterviewResultModal
          isOpen={isResultModalOpen}
          onClose={() => navigate("/dashboard/tests")}
          data={completionData}
        />
        {state === "interview" && (
          <Tour
            steps={getTourSteps()}
            isOpen={showTour}
            onClose={() => setShowTour(false)}
            onComplete={handleTourComplete}
            language={language}
          />
        )}
      </div>
    );
};

export default VideoAssessment;
