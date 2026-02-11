// src/pages/tests/QuestionModal.tsx
import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  open: boolean;
  initialQuestion: string;
  onClose: () => void;
  onSubmit: (editedQuestion: string, timeMinutes: number) => Promise<void>;
  loading?: boolean;
}

export default function QuestionModal({
  open,
  initialQuestion,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setQuestion(initialQuestion || "");
    setIsEditing(false);
  }, [initialQuestion, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (timeMinutes <= 0) return;

    try {
      await onSubmit(question, timeMinutes);
      onClose();
    } catch (error) {
      console.error("Failed to submit question:", error);
    }
  };

  // Format text for markdown (preserve numbers and newlines)
  //   const formattedQuestion = question
  //     .replace(/\\n/g, "\n") // Convert escaped \n to real newlines
  //     .replace(/\n(?=\d+\.)/g, "\n\n"); // Add extra space before numbered lines for markdown

  // Format text for markdown (preserve numbers and newlines)
  const formattedQuestion = question
    .replace(/\\n/g, "\n") // escaped \n → actual newline
    .replace(/(\r?\n){1,}/g, "\n\n") // ensure double newline between paragraphs
    .replace(/\n(?=\d+\.)/g, "\n\n") // ensure numbered questions are spaced
    .replace(/(?<!\n)\d+\.\s/g, "\n$&"); // ensure number always starts from new line

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#0a1b30]/90 to-[#071226]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a1b30]/95">
          <h3 className="text-white font-semibold text-lg">
            Review Generated Questions
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Time input */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Test Duration (minutes) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter test duration in minutes"
                required
                disabled={loading}
              />
            </div>

            {/* Toggle between view and edit mode */}
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-300">
                Generated Questions <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-blue-400 hover:text-blue-300 transition"
                disabled={loading}
              >
                {isEditing ? "Preview" : "Edit"}
              </button>
            </div>

            {/* Both modes support markdown */}
            <div className="w-full min-h-[400px] p-4 rounded-lg bg-[#0a1b30]/50 border border-white/10 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={formattedQuestion}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter or edit question text here..."
                  className="w-full h-[400px] p-4 rounded-lg bg-[#0a1b30]/50 text-white border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none font-mono text-sm"
                  required
                  disabled={loading}
                />
              ) : (
                <div className="text-white prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{formattedQuestion}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 p-6 border-t border-white/10 bg-[#0a1b30]/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim() || timeMinutes <= 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Creating Test..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
