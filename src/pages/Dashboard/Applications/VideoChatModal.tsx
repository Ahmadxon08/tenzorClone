import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { User, Bot, Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatMessage {
  id: string;
  sender: "Human" | "AI";
  message: string;
  timestamp: string;
}

interface VideoChatModalProps {
  sessionId: string;
  videoUrl: string;
  name: string;
  open: boolean;
  onClose: () => void;
  token?: string | null;
}

const VideoChatModal: React.FC<VideoChatModalProps> = ({
  sessionId,
  videoUrl,
  name,
  open,
  onClose,
}) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { t } = useTranslation();

  const handleDownloadVideo = useCallback(async () => {
    if (!videoUrl) return;
    
    setDownloading(true);
    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `video-${sessionId}-${(name || 'user').replace(/\s+/g, '-')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download video:', error);
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  }, [videoUrl, sessionId, name]);

  useEffect(() => {
    if (!open || !token) return;

    setMessages([]);

    const fetchChat = async () => {
      setLoading(true);
      console.log("applicant.videoUrl", videoUrl);
        try {
        const res = await apiService.getVideoChat(sessionId, token);
        const rawChat = Array.isArray(res?.data) ? res.data : [];
        const chatMessages: ChatMessage[] = rawChat.map(
          (msg: any, index: number) => {
            if (msg.role === "user") {
              return {
                id: `H-${index}`,
                sender: "Human",
                message: msg.message_text,
                timestamp: new Date().toISOString(),
              };
            } else if (msg.role === "model") {
              return {
                id: `AI-${index}`,
                sender: "AI",
                message: msg.message_text.trim(),
                timestamp: new Date().toISOString(),
              };
            } else {
              return {
                id: `AI-${index}`,
                sender: "AI",
                message: "",
                timestamp: new Date().toISOString(),
              };
            }
          }
        );
        const filtered = chatMessages.filter((m) => m.message.trim() !== "");
        setMessages(filtered);
        } catch (err: any) {
        console.error("Failed to fetch chat:", err);
        } finally {
          setLoading(false);
        }
    };

    fetchChat();
  }, [open, sessionId, token, videoUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="ssm:max-w-[620px]
        w-[95vw]
        max-h-[90vh]
        overflow-hidden
        bg-gradient-to-br from-[#0a1b30] to-[#071226]
        border border-white/10
        text-white
        shadow-2xl
        rounded-2xl
        flex
        flex-col">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-5 text-2xl font-semibold text-blue-400">
            <User size={26} className="text-blue-400" />{" "}
            {t("applicationsPage.chatModal.title", { name: name })}
          </DialogTitle>
        </DialogHeader>
       
        {videoUrl && (
          <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-white/10 relative">
            <video
              src={videoUrl}
              controls
            className="w-full object-cover max-h-[180px] sm:max-h-[240px]"
            >
              {t("applicationsPage.chatModal.videoNotSupported") ||
                "Your browser does not support the video tag."}
            </video>
            <div className="absolute top-2 right-2">
              <button
                onClick={handleDownloadVideo}
                disabled={downloading}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 text-white text-xs font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("applicationsPage.chatModal.downloadVideo")}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className="truncate">
                  {downloading
                    ? (t("applicationsPage.chatModal.downloading") || "Downloading...")
                    : t("applicationsPage.chatModal.downloadVideo")}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="chat-body max-h-[220px] overflow-y-auto mt-4 mb-4 p-4 border border-white/10 rounded-lg flex flex-col gap-4 chat-body">
          {loading && (
            <p className="text-gray-400">
              {t("applicationsPage.chatModal.loading")}
            </p>
          )}
          {!loading && messages.length === 0 && !(videoUrl && videoUrl.toString().toLowerCase().startsWith("https")) && (
            <p className="text-gray-400">
              {t("applicationsPage.chatModal.noMessages")}
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 p-3 rounded-xl max-w-[80%] shadow transition-all ${
                msg.sender === "Human"
                  ? "self-end bg-blue-600/40 text-white"
                  : "self-start bg-gray-700/50 text-gray-100"
              }`}
            >
              <div className="flex-shrink-0 flex items-start justify-center">
                {msg.sender === "Human" ? (
                  <User size={26} className="text-blue-300 flex-none" />
                ) : (
                  <Bot size={26} className="text-green-300 flex-none" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {msg.message}
                </p>
                <span className="text-gray-400 text-xs mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-medium bg-blue-600/60 hover:bg-blue-600/80 transition text-white"
          >
            {t("applicationsPage.chatModal.closeButton")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoChatModal;
