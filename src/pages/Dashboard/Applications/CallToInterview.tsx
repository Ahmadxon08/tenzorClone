// src/components/CallToInterview.tsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Check, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useWidgetConfig } from "../../../contexts/widgetContextCore";

interface CallToInterviewProps {
  open: boolean;
  onClose: () => void;
  name?: string;
  phone?: string;
  vakandId: number | undefined;
  vacancy?: string;
  siteName?: string;
  onSubmit: (data: {
    title: string;
    description: string;
    interviewDate: string;
    companyName: string;
  }) => void;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const interviewFormSchema = z.object({
  title: z.string().min(1, "Lavoza sarlavhasi kiritilmadi"),
  description: z
    .string()
    .max(500, "Maksimal 500 belgi ruxsat etiladi")
    .optional(),
  interviewDate: z.string().min(1, "Suhbat vaqti kiritilmadi"),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

const CallToInterview: React.FC<CallToInterviewProps> = ({
  open,
  onClose,
  name,
  phone,
  vacancy = "",
  siteName = "",
  vakandId,
  onSubmit,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation("");
  const { config } = useWidgetConfig();
  const { token } = useAuth();

  const publicKey =
    config?.publicKey ?? config?.public_key ?? "JhwH4LrDLnVgQ3GC";

  const { control, watch, handleSubmit, reset } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    mode: "onChange",
    defaultValues: {
      title: vacancy,
      description: "",
      interviewDate: "",
    },
  });

  // const descriptionValue = watch("description") ?? "";
  // const descriptionLength = descriptionValue.length;
  // const maxDescriptionChars = 500;

  // Update form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        title: vacancy,
        description: "",
        interviewDate: "",
      });
    }
  }, [open, vacancy, reset]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const validateRequiredFields = () => {
    const errors: string[] = [];

    if (!phone?.trim()) {
      errors.push("Ariza beruvchining telefon raqami topilmadi");
    }
    if (!siteName?.trim()) {
      errors.push("Kompaniya nomi topilmadi");
    }

    return errors;
  };

  const handleSendSMS = async (formData: InterviewFormData) => {
    const validationErrors = validateRequiredFields();

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => showToast(error, "error"));
      return;
    }

    try {
      setIsLoading(true);
      const date = formData.interviewDate.split("T")[0];
      const time = formData.interviewDate.split("T")[1];

      const response = await apiService.sendSMS(
        {
          vakand_id: vakandId,
          date,
          time,
          message_template: formData.description ?? "",
        },
        token || "",
        publicKey,
        siteName
      );

      if (response.status === "success" || response.status_code === 200) {
        console.log("SMS API response:", response);
        showToast("SMS muvaffaqiyatli yuborildi ✓");
        onSubmit({
          title: formData.title,
          description: formData.description ?? "",
          interviewDate: formData.interviewDate,
          companyName: siteName,
        });
        onClose();
      } else {
        console.log("SMS API response:", response);
        showToast(
          "SMS yuborishda xatolik: " + (response.message || "Noma'lum xatolik"),
          "error"
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast("SMS yuborishda xatolik yuz berdi: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValidWithLocation =
    Boolean(watch("title")?.trim()) && Boolean(watch("interviewDate")?.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
        max-w-[680px] sm:max-w-[680px]
        w-full
        max-h-[90vh]
        overflow-hidden
        flex flex-col
        bg-gradient-to-br from-[#0a1b30] to-[#071226]
        border border-white/10
        text-white
        p-0
        shadow-2xl
        rounded-2xl
      "
      >
        {/* TOASTS */}
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                flex items-center gap-2 p-3 rounded-lg text-sm font-medium
                pointer-events-auto animate-in fade-in slide-in-from-right-5
                ${
                  toast.type === "success"
                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                    : "bg-red-500/20 border border-red-500/50 text-red-300"
                }
              `}
            >
              {toast.type === "success" ? (
                <Check size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {toast.message}
            </div>
          ))}
        </div>

        {/* HEADER */}
        <DialogHeader className="border-b border-white/10 px-6 py-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold text-blue-400">
            {t("applicationsPage.call.title")}
          </DialogTitle>
        </DialogHeader>

        {/* CONTENT */}
        <form
          onSubmit={handleSubmit(handleSendSMS)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* APPLICANT INFO */}
            <div className="p-4 border border-white/10 rounded-lg bg-[#0a1b30]/60">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                📋 {t("applicationsPage.call.applicant")}
              </p>
              <div className="space-y-2">
                <p className="text-base font-semibold text-white">
                  {name || "-"}
                </p>
                <p className="text-sm text-gray-400">{phone || "-"}</p>
              </div>
            </div>

            {/* INTERVIEW DETAILS */}
            <div className="p-4 border border-white/10 rounded-lg bg-[#0a1b30]/60 space-y-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                📝 {t("applicationsPage.call.details")}
              </p>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("applicationsPage.call.position")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={t("applicationsPage.call.positionPh")}
                      disabled
                      className="
                      w-full px-4 py-3
                      bg-[#0a1b30]/50
                      border border-white/10
                      rounded-lg text-white
                      placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      focus:border-blue-500/50
                      transition-all
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                    />
                  )}
                />
              </div>

              {/* INTERVIEW DATE */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("applicationsPage.call.date")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="interviewDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="datetime-local"
                      className="
                      w-full px-4 py-3
                      bg-[#0a1b30]/50
                      border border-white/10
                      rounded-lg text-white
                      placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      focus:border-blue-500/50
                      transition-all
                      [color-scheme:dark]
                    "
                    />
                  )}
                />
              </div>
            </div>

            {/* COMPANY INFO */}
            <div className="p-4 border border-white/10 rounded-lg bg-[#0a1b30]/60 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                🏢 {t("applicationsPage.call.company")}
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  <span className="text-gray-400">Kompaniya:</span>{" "}
                  <span className="font-semibold text-blue-300">
                    {siteName || "-"}
                  </span>
                </p>
              </div>
            </div>

            {/* SMS CONTENT / DESCRIPTION */}
            {/* <div className="p-4 border border-white/10 rounded-lg bg-[#0a1b30]/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  💬 SMS Matn
                </label>
                <span
                  className={`text-xs font-semibold ${
                    descriptionLength > maxDescriptionChars
                      ? "text-red-400"
                      : "text-gray-500"
                  }`}
                >
                  {descriptionLength}/{maxDescriptionChars}
                </span>
              </div>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="SMS matnini tahrirlang..."
                    rows={5}
                    className={`
                    w-full px-4 py-3
                    bg-[#0a1b30]/50
                    border rounded-lg text-white
                    placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    focus:border-blue-500/50
                    transition-all resize-none
                    ${
                      descriptionLength > maxDescriptionChars * 0.9
                        ? "border-yellow-500/50 focus:ring-yellow-500/50"
                        : "border-white/10"
                    }
                  `}
                  />
                )}
              />
              {descriptionLength > maxDescriptionChars * 0.8 && (
                <p
                  className={`text-xs ${
                    descriptionLength > maxDescriptionChars
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {descriptionLength > maxDescriptionChars
                    ? "⚠️ Maksimal 500 belgi ruxsat etiladi"
                    : `📝 Qolgan: ${maxDescriptionChars - descriptionLength} belgi`}
                </p>
              )}
            </div> */}

            {/* Form Requirements Note */}
            {/* <p className="text-xs text-gray-500">
              {t("applicationsPage.call.requiredNote")}
            </p> */}
          </div>

          {/* FOOTER */}
          <DialogFooter className="border-t border-white/10 px-6 py-4 flex gap-3 bg-[#0a1b30]/40 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
              flex-1 px-4 py-3
              bg-[#0a1b30]/60 hover:bg-[#0f2140]
              border border-white/10 hover:border-white/20
              rounded-lg text-white
              font-medium transition-all disabled:opacity-50
            "
            >
              {t("applicationsPage.call.cancel")}
            </button>

            <button
              type="submit"
              disabled={!isFormValidWithLocation || isLoading}
              className={`
              flex-1 px-4 py-3
              rounded-lg text-white font-medium
              transition-all shadow-lg
              ${
                isFormValidWithLocation && !isLoading
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/20 cursor-pointer"
                  : "bg-gray-600/50 cursor-not-allowed opacity-50"
              }
            `}
            >
              {isLoading
                ? "Yuborilmoqda..."
                : t("applicationsPage.call.submit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CallToInterview;
