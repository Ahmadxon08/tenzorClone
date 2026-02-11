import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { User, Bot, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatMessage {
  id: string;
  sender: "Human" | "AI";
  message: string;
  timestamp: string;
}

interface ChatModalProps {
  sessionId: string;
  applicantName: string;
  open: boolean;
  onClose: () => void;
  token?: string | null;
  videoUrl?: string | null;
}

const ChatModal: React.FC<ChatModalProps> = ({
  sessionId,
  applicantName,
  open,
  onClose,
  videoUrl,
}) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open || !token) return;

    setMessages([]);

    const fetchChat = async () => {
      setLoading(true);
      try {
        const data = await apiService.getChat(sessionId, token);

        const chatMessages: ChatMessage[] = data.chat.map(
          (msg: any, index: number) => {
            if (msg.Human) {
              let text = "";
              if (typeof msg.Human === "string") {
                text = msg.Human.replace(
                  /"message":|"description":|"required_question":|"resume":|"session_id":|"public_key":/g,
                  ""
                )
                  .replace(/\\n/g, "\n")
                  .trim();
              } else if (typeof msg.Human === "object") {
                text = msg.Human.message || "";
              }

              return {
                id: `H-${index}`,
                sender: "Human",
                message: text,
                timestamp: new Date().toISOString(),
              };
            } else if (msg.AI) {
              return {
                id: `AI-${index}`,
                sender: "AI",
                message: msg.AI.trim(),
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
  }, [open, sessionId, token]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 text-white p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-5 text-2xl font-semibold text-blue-400">
            <User size={26} className="text-blue-400" />{" "}
            {t("applicationsPage.chatModal.title", { name: applicantName })}
          </DialogTitle>
        </DialogHeader>

        {videoUrl && videoUrl.toString().toLowerCase().startsWith("https") && (
          <div className="mt-4 mb-4 rounded-lg overflow-hidden border border-white/10 relative">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              style={{ maxHeight: "300px" }}
            >
              {t("applicationsPage.chatModal.videoNotSupported") ||
                "Your browser does not support the video tag."}
            </video>
            <div className="absolute top-2 right-2">
              <a
                href={videoUrl}
                download={`video-${sessionId}-${(applicantName || 'user').replace(/\s+/g, '-')}.mp4`}
                className="flex items-center gap-2 px-3 py-2 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                {t("applicationsPage.chatModal.downloadVideo") || "Скачать видео"}
              </a>
            </div>
          </div>
        )}

        <div className="chat-body max-h-[450px] overflow-y-auto mt-4 mb-4 p-4 border border-white/10 rounded-lg flex flex-col gap-4 chat-body">
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

export default ChatModal;
