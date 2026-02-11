// src/components/TestFormModal.tsx
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import type { CreateOrUpdateTestDto, TestItem, Vacancy } from "../types";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateOrUpdateTestDto) => Promise<void>;
  initial?: TestItem | null;
  vacancies: Vacancy[];
  loading?: boolean;
  title?: string;
}

export default function TestFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  vacancies,
  loading,
  title,
}: Props) {
  const { t } = useTranslation();

  const [values, setValues] = useState<CreateOrUpdateTestDto>({
    position_name: "",
    position_role: "",
    required: "",
    test_question: [],
    work_experiance: "",
    vakansiya_id: vacancies?.[0]?.id ?? 0,
    number_of_questions: 0,
    time_minut: 10,
  });
  const [questions, setQuestions] = useState<{ text: string }[]>([
    { text: "" },
  ]);
  const [requirements, setRequirements] = useState<{ text: string }[]>([
    { text: "" },
  ]);
  const [tempNumberOfQuestions, setTempNumberOfQuestions] = useState<string>(
    values.number_of_questions.toString()
  );
  const numberDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initial) {
      setValues({
        position_name: initial.position_name,
        position_role: initial.position_role,
        required: typeof initial.required === "string" ? initial.required : "",
        test_question: Array.isArray(initial.test_question) 
          ? (initial.test_question as string[])
          : typeof initial.test_question === "string" && initial.test_question.trim()
            ? initial.test_question.split("\n")
            : [],
        work_experiance: initial.work_experiance,
        vakansiya_id: initial.vakansiya_id,
        number_of_questions: initial.number_of_questions || 0,
        time_minut: initial.time_minut || 10,
      });

      setQuestions(
        Array.isArray(initial.test_question)
          ? (initial.test_question as string[]).map((q: string) => ({ text: q }))
          : typeof initial.test_question === "string" &&
            initial.test_question.trim()
            ? initial.test_question.split("\n").map((q) => ({ text: q }))
            : [{ text: "" }]
      );

      setRequirements(
        typeof initial.required === "string" && initial.required.trim()
          ? initial.required.split("\n").map((r) => ({ text: r }))
          : [{ text: "" }]
      );
      setTempNumberOfQuestions((initial.number_of_questions || 0).toString());
    } else {
      setQuestions([{ text: "" }]);
      setRequirements([{ text: "" }]);
      setTempNumberOfQuestions("0");
    }
  }, [initial, open]);

  const update = (name: keyof CreateOrUpdateTestDto, v: string | number) =>
    setValues((p) => ({ ...p, [name]: v }));

  const handleNumberOfQuestionsChange = (value: string) => {
    setTempNumberOfQuestions(value);

    // Clear existing timeout
    if (numberDebounceRef.current) {
      clearTimeout(numberDebounceRef.current);
    }

    // If value is empty, set timeout to revert to 0 after 1 second
    if (value === "") {
      numberDebounceRef.current = setTimeout(() => {
        update("number_of_questions", 0);
        setTempNumberOfQuestions("0");
      }, 1000);
    } else {
      // If value is not empty, update immediately
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        update("number_of_questions", numValue);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1️⃣ Normalize questions & requirements from arrays
    const questionText = questions.map((q) => q.text.trim()).filter((q) => q);
    const requirementText = requirements.map((r) => r.text.trim()).join("\n");

    // 2️⃣ Validate arrays
    if (questionText.length === 0) {
      toast.error(t("testForm.validation.requiredQuestionRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!requirementText.trim()) {
      toast.error(t("testForm.validation.requiredRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // 3️⃣ Build payload for backend
    const payload: CreateOrUpdateTestDto = {
      ...values,
      test_question: questionText,
      required: requirementText,
    };

    // 4️⃣ Validate other fields
    if (!payload.position_name.trim()) {
      toast.error(t("testForm.validation.positionNameRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!payload.position_role.trim()) {
      toast.error(t("testForm.validation.positionRoleRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!payload.work_experiance.trim()) {
      toast.error(t("testForm.validation.workExperienceRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!payload.number_of_questions || payload.number_of_questions <= 0) {
      toast.error("Number of questions is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!payload.time_minut || payload.time_minut <= 0) {
      toast.error("Time is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (payload.test_question.length === 0) {
      toast.error(t("testForm.validation.requiredQuestionRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // 5️⃣ Submit to parent
    try {
      await onSubmit(payload);
      // Parent handles closing / reloading
    } catch (error: any) {
      console.error("Failed to save test:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gradient-to-br from-[#0a1b30]/90 to-[#071226]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#0a1b30]/95 backdrop-blur-lg z-10">
          <h3 className="text-white text-lg font-semibold">
            {title ??
              (initial ? t("testForm.title.edit") : t("testForm.title.create"))}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-300 cursor-pointer hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
          {/* Position Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {t("testForm.fields.positionName.label")}{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              value={values.position_name}
              onChange={(e) => update("position_name", e.target.value)}
              className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder={
                t("testForm.fields.positionName.placeholder") ??
                "Frontend Developer"
              }
              required
              disabled={loading}
            />
          </div>

          {/* Position Role */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {t("testForm.fields.positionRole.label")}{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              value={values.position_role}
              onChange={(e) => update("position_role", e.target.value)}
              className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder={
                t("testForm.fields.positionRole.placeholder") ??
                "Junior / Middle / Senior"
              }
              required
              disabled={loading}
            />
          </div>


          {/* Questions */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">
              {t("testForm.fields.testQuestion.label")}{" "}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              rows={5}
              value={questions.map((q) => q.text).join("\n")}
              onChange={(e) => {
                const questionsText = e.target.value;
                setQuestions(
                  questionsText
                    .split("\n")
                    .filter(Boolean)
                    .map((q) => ({ text: q }))
                );
              }}
              className="w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white"
              placeholder={
                t("testForm.fields.testQuestion.placeholder") ??
                "Enter questions, one per line..."
              }
            />
          </div>

          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">
              {t("testForm.fields.required.label")}{" "}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              rows={5}
              value={requirements.map((r) => r.text).join("\n")}
              onChange={(e) => {
                const requirementsText = e.target.value;
                setRequirements(
                  requirementsText
                    .split("\n")
                    .filter(Boolean)
                    .map((r) => ({ text: r }))
                );
              }}
              className="w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white"
              placeholder={
                t("testForm.fields.required.placeholder") ||
                "Enter requirements, one per line..."
              }
            />
          </div>

          <div className="flex gap-4 md:col-span-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">
                {t("testForm.fields.workExperience.label")}
              </label>
              <input
                value={values.work_experiance}
                onChange={(e) => update("work_experiance", e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={
                  t("testForm.fields.workExperience.placeholder") ?? "1-3 years"
                }
                disabled={loading}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">
                {t("testForm.fields.numberOfQuestions.label")}{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={tempNumberOfQuestions}
                onChange={(e) =>
                  handleNumberOfQuestionsChange(e.target.value)
                }
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all no-spinner"
                placeholder={
                  t("testForm.fields.numberOfQuestions.placeholder") ??
                  "Enter number of questions"
                }
                required
                disabled={loading}
              />
            </div>

            {initial && (
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">
                Time (minutes) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={values.time_minut}
                onChange={(e) => update("time_minut", Number(e.target.value))}
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all no-spinner"
                placeholder="Enter test duration"
                required
                disabled={loading}
              />
            </div>
            )}
          </div>
          <div className="p-4 border-t border-white/10 flex justify-end gap-3  backdrop-blur-lg z-10 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 cursor-pointer rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              {t("testForm.actions.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center cursor-pointer gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/20"
            >
              {loading
                ? "Loading..."
                : initial
                  ? t("testForm.actions.save")
                  : t("testForm.actions.create")}
            </button>
          </div>
        </form>

        {/* Footer */}
      </div>
    </div>
  );
}
