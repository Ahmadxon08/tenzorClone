import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import RightSection from "./RightSection";
import type { VacancyFormData, Language } from "./createVacation.type";
import RichEditor from "./textArea";
import { Skeleton } from "antd";
import {
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
} from "../../../store/api/vacancyHooks";
import { allSkills } from "./Skills";

const WorkExprerience = [
  { label: "Tajribasiz", value: "0" },
  { label: "0–1 yil", value: "0-1" },
  { label: "1–3 yil", value: "1-3" },
  { label: "3–6 yil", value: "3-6" },
  { label: "6+ yil", value: "6+" },
];
const SelectLanguages = [
  "O'zbek tili",
  "Rus tili",
  "Ingiliz tili",
  "Arab tili",
  "Frantsiz tili",
  "Yapon tili",
];

interface ApiSite {
  site_id?: string | number | null;
  site_name: string;
  site_domain: string;
  public_key: string;
  domain_id?: string | number | null;
  is_new?: boolean;
}

interface Site {
  site_name: string;
  public_key: string;
  site_domain: string;
  site_id: number;
  domain_id: number;
}
import dynamic from "next/dynamic";
import { address } from "../../../constants/address";
const Map = dynamic(() => import("../../../components/shared/Map"), {
  ssr: false,
});
const normalizeSite = (apiSite: ApiSite): Site | null => {
  const siteId =
    typeof apiSite.site_id === "number"
      ? apiSite.site_id
      : typeof apiSite.site_id === "string"
        ? parseInt(apiSite.site_id, 10)
        : null;

  const domainId =
    typeof apiSite.domain_id === "number"
      ? apiSite.domain_id
      : typeof apiSite.domain_id === "string"
        ? parseInt(apiSite.domain_id, 10)
        : null;

  if (!siteId || isNaN(siteId)) {
    console.warn("Invalid site_id:", apiSite);
    return null;
  }

  return {
    site_id: siteId,
    site_name: apiSite.site_name,
    site_domain: apiSite.site_domain,
    public_key: apiSite.public_key,
    domain_id: domainId || 0,
  };
};

const scheduleOptions = ["5/2", "6/1", "2/2", "Masofaviy"];
export const WORK_SHIFTS = [
  {
    key: "day",
    value: "day", // 🔒 backendga ketadigan qiymat
    labelKey: "vacancyForm.workShifts.day",
  },
  {
    key: "evening",
    value: "evening",
    labelKey: "vacancyForm.workShifts.evening",
  },
  {
    key: "night",
    value: "night",
    labelKey: "vacancyForm.workShifts.night",
  },
];

const CreateVacancyPage: React.FC = () => {
  const [isMapOpenModel, setIsMapOpenModel] = useState(false);
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const createVacancyMutation = useCreateVacancyMutation();
  const updateVacancyMutation = useUpdateVacancyMutation();
  const location = useLocation();
  const editData = location.state?.vacancy; // Tahrirlash uchun ma'lumot
  const isEditMode = !!editData; // Agar editData bo'lsa, demak tahrirlash rejimida
  const [formData, setFormData] = useState<VacancyFormData>({
    title: "",
    salary: "",
    valyuta: "",
    work_experiance: "",
    work_schedule: "",
    work_time: "",
    required: "",
    required_question: "",
    description: "",
    position_name: "",
    position_role: "",
    widget_question: "",
    test_id: 0,
    acceptance_rate: 65,
    has_video: false,
    has_widget: false,
    number_of_questions: null,
    languages: [],
    work_shifts: [],
    students: false,
    coords: {
      lat: null,
      long: null,
    },
    address: "",
    region: "", // ✅ yangi qo'shildi
    district: "",
  });

  useEffect(() => {
    if (isEditMode && editData) {
      // Handle video/widget settings based on vakansiya_type
      let has_video = false;
      let has_widget = false;

      if (editData.vakansiya_type) {
        if (editData.vakansiya_type === "both") {
          has_video = true;
          has_widget = true;
        } else if (editData.vakansiya_type === "video") {
          has_video = true;
          has_widget = false;
        } else if (editData.vakansiya_type === "widget") {
          has_video = false;
          has_widget = true;
        }
      } else {
        // Fallback to direct values if vakansiya_type is not available
        has_video = editData.has_video ?? false;
        has_widget = editData.has_widget ?? false;
      }

      // Ensure languages array is properly initialized
      const languages =
        editData.languages && Array.isArray(editData.languages)
          ? editData.languages
          : [];

      // Ensure work_shifts array is properly initialized and normalized
      let work_shifts = [];
      if (editData.work_shifts && Array.isArray(editData.work_shifts)) {
        // Normalize work shift values to use consistent keys
        work_shifts = editData.work_shifts.map((shift: string) => {
          // Convert various possible values to standard keys
          if (
            shift.toLowerCase().includes("day") ||
            shift.toLowerCase().includes("kun")
          )
            return "day";
          if (
            shift.toLowerCase().includes("evening") ||
            shift.toLowerCase().includes("kech")
          )
            return "evening";
          if (
            shift.toLowerCase().includes("night") ||
            shift.toLowerCase().includes("tun")
          )
            return "night";
          return shift; // fallback to original value
        });
      }

      const updatedFormData = {
        title: editData.title || "",
        salary: editData.salary || "",
        valyuta: editData.valyuta || "",
        work_experiance: editData.work_experiance || "",
        work_schedule: editData.work_schedule || "",
        work_time: editData.work_time || "",
        required: editData.required || "",
        required_question: editData.required_question || "",
        description: editData.description || "",
        position_name: editData.position_name || "",
        position_role: editData.position_role || "",
        widget_question: editData.widget_question || "",
        test_id: editData.test_id || 0,
        acceptance_rate: editData.acceptance_rate || 65,
        has_video: has_video,
        has_widget: has_widget,
        number_of_questions: editData.number_of_questions ?? null,
        languages: languages,
        work_shifts: work_shifts,
        students: editData.students ?? false,
        vakansiya_type: editData.vakansiya_type,
        coords: editData.coords,
        address: "",
        region: "", // ✅ yangi qo'shildi
        district: "",
      };
      setFormData(updatedFormData);

      // Initialize skills from edit data
      if (editData.required) {
        const skillsArray = editData.required
          .split("/n")
          .filter((skill: string) => skill.trim());
        setSelectSkills(skillsArray);
      }
    }
  }, [editData, isEditMode]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuestion] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const [isCustomSchedule, setIsCustomSchedule] = useState(false);

  const [tempGeneratedText, setTempGeneratedText] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // AI dan kelgan question oynasini ochilishi va text vaqtincha saqlanishi uchun
  const [tempGeneratedQuestionText, setTempGeneratedQuestionText] =
    useState<string>("");
  const [isQuestionModalOpen, setIsQuestionModalOpen] =
    useState<boolean>(false);
  //  skills konikmalar uchun statelar
  const [selectSkills, setSelectSkills] = useState<string[]>([]);
  const [onFocusSkillInput, setOnFocusSkillInput] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      if (!token) {
        const errorMsg = t("vacancyForm.noToken") || "No authentication token";
        setSitesError(errorMsg);
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoadingSites(true);
      setSitesError(null);

      try {
        const response = await apiService.me(token);

        if (
          response.sites &&
          Array.isArray(response.sites) &&
          response.sites.length > 0
        ) {
          const normalizedSites = response.sites
            .map((site: ApiSite) => normalizeSite(site))
            .filter((s: Site | null): s is Site => s !== null);

          if (normalizedSites.length > 0) {
            setSites(normalizedSites);
            setSelectedSite(normalizedSites[0]);
          } else {
            const errorMsg =
              t("vacancyForm.noValidSites") || "No valid sites available";
            setSitesError(errorMsg);
            toast.warning(errorMsg, { position: "top-right", autoClose: 4000 });
          }
        } else {
          const errorMsg = t("vacancyForm.noSites") || "No sites available";
          setSitesError(errorMsg);
          toast.warning(errorMsg, { position: "top-right", autoClose: 4000 });
        }
      } catch (err) {
        console.error("Error fetching sites:", err);
        const errorMsg =
          t("vacancyForm.errorFetchingSites") || "Failed to fetch sites";
        setSitesError(errorMsg);
        toast.error(errorMsg, { position: "top-right", autoClose: 4000 });
      } finally {
        setLoadingSites(false);
      }
    };

    fetchSites();
  }, [token, t]);
  const validateRequiredFields = (data: VacancyFormData) => {
    if (!data.title?.trim()) return t("vacancyForm.errors.titleRequired");
    if (!data.required?.trim()) return t("vacancyForm.errors.skillsRequired");
    if (!data.has_video && !data.has_widget) {
      return t("vacancyForm.errors.selectOption");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) {
      toast.error(t("vacancyForm.selectSiteAlert") || "Please select a site");
      return;
    }
    const validateErr = validateRequiredFields(formData);
    if (validateErr) {
      toast.error(validateErr);
      return;
    }
    const finalData: VacancyFormData = {
      ...formData,
      required: selectSkills.join("/n"),
      work_schedule: formData.work_schedule,
      languages: formData.languages,
      has_video: formData.has_video,
      has_widget: formData.has_widget,
      number_of_questions: formData.number_of_questions || 6,
      vakansiya_type: (formData.has_video && formData.has_widget
        ? "both"
        : formData.has_video
          ? "video"
          : "widget") as "video" | "widget" | "both",
    };
    console.log("Backendga jonatish:", finalData);

    try {
      setIsLoading(true);
      const toastMessage = isEditMode
        ? t("vacancyForm.updatingVacancy")
        : t("vacancyForm.savingVacancy");
      toast.loading(toastMessage, { toastId: "saveManual" });
      if (isEditMode) {
        await updateVacancyMutation.mutateAsync({
          id: editData.id,
          data: finalData,
          publicKey: selectedSite.public_key,
          siteDomain: selectedSite.site_domain,
        });
        toast.update("saveManual", {
          render: t("vacancyForm.updateSuccess"),
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
      } else {
        await createVacancyMutation.mutateAsync({
          data: finalData,
          publicKey: selectedSite.public_key,
          siteDomain: selectedSite.site_domain,
        });

        toast.update("saveManual", {
          render: t("vacancyForm.createSuccess"),
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
      }
      navigate("/dashboard/vacancies");
    } catch (err) {
      console.error(err);
      const error = err as { message?: string };
      const errorMessage = isEditMode
        ? error?.message || t("vacancyForm.updateError")
        : error?.message || t("vacancyForm.createError");

      toast.update("saveManual", {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDescriptionAI = async () => {
    if (!selectedSite) {
      toast.error(t("vacancyForm.errors.selectSite"));
      return;
    }
    if (!formData.title?.trim() || formData.description.length === 0) {
      toast.warning(t("vacancyForm.errors.fillTitleAndQuestion"));
      return;
    }
    const tid = toast.loading(t("vacancyForm.generatingDescription"));
    try {
      setIsConfirmModalOpen(true);
      setIsGenerating(true);
      const payload = {
        ...formData,
        tittle: formData.title,
        required_question: formData.required_question,
        work_experiance: formData.work_experiance || "",
        work_schedule: formData.work_schedule || "",
        position_name: formData.position_name || "",
        salary: formData.salary || "",
        valyuta: formData.valyuta || "",
        position_role: formData.position_role || "",
        describe: formData.description,
        required: selectSkills.join("/n"),
      };

      const res = await apiService.generateVacancyDescription(payload);
      const generatedDescription = res.answer || "";
      setTempGeneratedText(generatedDescription);
      toast.update(tid, {
        render: t("vacancyForm.descriptionGenerated"),
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error generating description:", err);
      toast.update(tid, {
        render:
          error?.message || t("vacancyForm.errors.generateDescriptionFailed"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleGenerateQuestionAi = async () => {
    if (!selectedSite) {
      toast.error(t("vacancyForm.errors.selectSite"));
      return;
    }
    if (!formData.title?.trim()) {
      return toast.info(
        "Iltimos description uchun boshlangich malumot kiriting",
      );
    }
    const tid = toast.loading("Generating description...");

    try {
      setIsQuestionModalOpen(true);
      setIsGenerating(true);
      const payload = {
        ...formData,
        required_question: formData.required_question,
        tittle: formData.title,
        work_experiance: formData.work_experiance || "",
        work_schedule: formData.work_schedule || "",
        position_name: formData.title || "",
        salary: formData.salary || "",
        valyuta: formData.valyuta || "",
        position_role: formData.position_role || "",
        describe: formData.description,
        number_of_questions: formData.number_of_questions || 5,
        type: formData.vakansiya_type,
        required: selectSkills.join("/n"),
      };
      const res = await apiService.createQuestion(payload);
      const generatedQuestion = res.answer || "";
      // setFormData(prev => ({
      // 	...prev,
      // 	required_question: generatedQuestion,
      // }));
      setTempGeneratedQuestionText(generatedQuestion);

      toast.update(tid, {
        render: t("vacancyForm.questionsGenerated"),
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.log(error);
      console.error("Error generating description:", err);
      toast.update(tid, {
        render: t("vacancyForm.generateQuestionsFailed"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  // controll languagge
  const addLanguage = () => {
    // languages Status controling
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: "", level: "" }],
    }));
  };
  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };
  const updateLanguage = (
    index: number,
    field: keyof Language,
    value: string,
  ) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index][field] = value;
    setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
  };
  // ish semena function
  const toggleShift = (shift: string) => {
    setFormData((prev) => ({
      ...prev,
      work_shifts: prev.work_shifts.includes(shift)
        ? prev.work_shifts.filter((s) => s !== shift)
        : [...prev.work_shifts, shift],
    }));
  };

  const handleScheduleChange = (value: string) => {
    if (value === "other") {
      setIsCustomSchedule(true);
      setFormData({ ...formData, work_schedule: "" }); // Inputni tozalaymiz
    } else {
      setIsCustomSchedule(false);
      setFormData({ ...formData, work_schedule: value });
    }
  };

  // AI descriptioni tasdiqlash funcion
  const handleConfirmText = () => {
    setFormData((prev) => ({
      ...prev,
      description: tempGeneratedText,
    }));
    setIsConfirmModalOpen(false);
  };
  const handleSaveQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      required_question: tempGeneratedQuestionText,
    }));
    setIsQuestionModalOpen(false);
  };
  // controller handleSelectSkill
  // Ko'nikmani, skills tanlash (qo'shish)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Agar bosilgan joy container ichida bo'lmasa, ro'yxatni yopamiz
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOnFocusSkillInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !selectSkills.includes(trimmedSkill)) {
      // 1. Yangi massivni tayyorlaymiz
      const newSkills = [...selectSkills, trimmedSkill];

      // 2. Local state-ni yangilaymiz
      setSelectSkills(newSkills);

      // 3. To'g'ridan-to'g'ri formData-ga string qilib yozamiz
      setFormData((prev) => ({
        ...prev,
        required: newSkills.join(", "),
      }));

      setInputValue("");
    }
  };

  const removeSelectSkill = (skillToRemove: string) => {
    const filteredSkills = selectSkills.filter((s) => s !== skillToRemove);

    // 2. Local state-ni yangilaymiz
    setSelectSkills(filteredSkills);

    // 3. To'g'ridan-to'g'ri formData-ga yangilangan stringni yozamiz
    setFormData((prev) => ({
      ...prev,
      required: filteredSkills.join(", "),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleSelectSkill(inputValue.trim());
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      selectSkills.length > 0
    ) {
      // Input bo'sh bo'lganda o'chirish tugmasi bosilsa, oxirgi skillni o'chiradi
      removeSelectSkill(selectSkills[selectSkills.length - 1]);
    }
  };

  // location malumotlarni saqlash
  const handleLocationSelect = (latlng: L.LatLng, address: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
      coords: { lat: latlng.lat.toString(), long: latlng.lng.toString() },
    }));
  };
  const handleClearLoactionInfo = () => {
    setFormData((prev) => ({
      ...prev,
      address: "",
      coords: { lat: null, long: null },
    }));
    setIsMapOpenModel(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start w-full gap-2 lg:gap-4">
      <div className="p-4 lg:p-5 rounded-xl w-full lg:w-[50%] max-h-[90vh] overflow-y-auto no-scrollbar bg-gradient-to-br from-[#0a1b30] to-[#071226] border-white/10 text-white">
        <div className="text-white">
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Site Selection */}
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode
                ? t("vacancyForm.editVacancy")
                : t("vacancyForm.createVacancy")}
            </h2>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                {t("vacancyForm.selectSite.label")}{" "}
                <span className="text-red-500">*</span>
              </label>

              {loadingSites ? (
                <div className="w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-gray-400 flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
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
                  {t("vacancyForm.loadingSites")}
                </div>
              ) : sitesError ? (
                <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  {sitesError}
                </div>
              ) : sites.length === 0 ? (
                <div className="w-full px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                  {t("vacancyForm.noSitesAvailable")}
                </div>
              ) : (
                <Select
                  value={
                    selectedSite
                      ? `${selectedSite.site_id}_${selectedSite.site_domain}`
                      : ""
                  }
                  onValueChange={(value) => {
                    const site = sites.find(
                      (s) => `${s.site_id}_${s.site_domain}` === value,
                    );
                    if (site) setSelectedSite(site);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full px-3 lg:px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <SelectValue
                      placeholder={t("vacancyForm.selectSite.placeholder")}
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0a1b30] border-white/10 text-white">
                    {sites.map((site) => (
                      <SelectItem
                        key={`${site.site_id}_${site.site_domain}`}
                        value={`${site.site_id}_${site.site_domain}`}
                        className="focus:bg-blue-500/20 focus:text-white cursor-pointer"
                      >
                        {site.site_name} ({site.site_domain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.title.label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 lg:px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white placeholder-gray-500"
                  placeholder={t("vacancyForm.title.placeholder")}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.salary.label")}
                </label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => {
                    // Only allow numbers and hyphens
                    const value = e.target.value.replace(/[^0-9-]/g, "");
                    // Ensure only one hyphen is present and it's not at the start or end
                    const parts = value.split("-");
                    if (parts.length > 2) {
                      // If more than one hyphen, keep only the first part and the hyphen
                      setFormData({
                        ...formData,
                        salary: `${parts[0]}-${parts[1] || ""}`.replace(
                          /-+/g,
                          "-",
                        ),
                      });
                    } else if (value.endsWith("-") && !value.endsWith("--")) {
                      // Allow single hyphen at the end for range input
                      setFormData({ ...formData, salary: value });
                    } else if (
                      value.length === 0 ||
                      /^\d+$/.test(value) ||
                      /^\d+-\d*$/.test(value)
                    ) {
                      // Allow empty, numbers only, or number followed by hyphen and optional number
                      setFormData({ ...formData, salary: value });
                    }
                  }}
                  className="w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white"
                  placeholder={
                    t("vacancyForm.salary.placeholder") || "e.g. 1000-2000"
                  }
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.salaryValyuta.label")}
                </label>

                <Select
                  value={formData.valyuta || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, valyuta: value })
                  }
                >
                  {/* Trigger qismi: bg-transparent qilib o'zgartirildi */}
                  <SelectTrigger
                    className="w-full px-3 lg:px-4 py-3 bg-[#0a1b30]/50 min-h-[48px] border border-white/10 rounded-xl text-white placeholder-gray-500"
                    // className='w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                    // className='w-full px-4 h-[48px] bg-[#0a1b30]/50  border border-white/10 rounded-xl text-white placeholder-gray-500'
                  >
                    <SelectValue
                      placeholder={t("vacancyForm.salaryValyuta.placeholder")}
                    />
                  </SelectTrigger>

                  {/* Content qismi: bg-[#0a1b30] va backdrop-blur orqali videodagi oq fon yo'qoladi */}
                  <SelectContent className="bg-[#0a1b30]/95 backdrop-blur-lg border-white/10 text-white ">
                    <SelectItem
                      value="USD"
                      className="focus:bg-blue-500/20 focus:text-white cursor-pointer"
                    >
                      USD ($)
                    </SelectItem>
                    <SelectItem
                      value="UZS"
                      className="focus:bg-blue-500/20 focus:text-white cursor-pointer"
                    >
                      UZS (So'm)
                    </SelectItem>
                    <SelectItem
                      value="EUR"
                      className="focus:bg-blue-500/20 focus:text-white cursor-pointer"
                    >
                      EUR (€)
                    </SelectItem>
                    <SelectItem
                      value="RUB"
                      className="focus:bg-blue-500/20 focus:text-white cursor-pointer"
                    >
                      RUB (₽)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
              {/* Work Experience */}

              {/* Work Schedule (Ish jadvali) */}

              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.workSchedule.label")}
                </label>

                {!isCustomSchedule ? (
                  /* Standart Selector */
                  <Select
                    value={
                      scheduleOptions.includes(formData.work_schedule || "")
                        ? formData.work_schedule
                        : "other"
                    }
                    onValueChange={handleScheduleChange}
                  >
                    <SelectTrigger className="w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white">
                      {t("vacancyForm.placeholders.workSchedule")}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1b30] border-white/10 text-white rounded-xl">
                      {scheduleOptions.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="focus:bg-blue-500/20"
                        >
                          {t(`vacancyForm.workScheduleOptions.${opt}`)}
                        </SelectItem>
                      ))}
                      <div className="h-[1px] bg-white/10 my-1" />{" "}
                      {/* Ajratuvchi chiziq */}
                      <SelectItem
                        value="other"
                        className="text-blue-400 focus:bg-blue-500/20 font-medium"
                      >
                        {t("vacancyForm.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  /* Foydalanuvchi o'zi yozadigan Input */
                  <div className="relative animate-in slide-in-from-top-2 duration-200">
                    <input
                      autoFocus
                      type="text"
                      value={formData.work_schedule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          work_schedule: e.target.value,
                        })
                      }
                      placeholder={t(
                        "vacancyForm.placeholders.customWorkSchedule",
                      )}
                      className="w-full h-[50px] px-4 pr-12 bg-[#0a1b30]/50 border border-blue-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    {/* Ortga qaytish tugmasi (X) */}
                    <button
                      type="button"
                      onClick={() => setIsCustomSchedule(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-gray-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
              {/* Work Time (Ish vaqti) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.workTime.label")}
                </label>
                <input
                  type="text"
                  value={formData.work_time}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Faqat raqam, :, - ga ruxsat
                    value = value.replace(/[^0-9:-]/g, "");

                    // Faqat bitta "-" bo‘lsin
                    const dashCount = (value.match(/-/g) || []).length;
                    if (dashCount > 1) return;

                    // Har bir tomonda faqat bitta ":" bo‘lsin
                    const parts = value.split("-");
                    if (parts.some((p) => (p.match(/:/g) || []).length > 1))
                      return;

                    setFormData({ ...formData, work_time: value });
                  }}
                  placeholder={t("vacancyForm.workTime.placeholder")}
                  className="w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.numberOfQuestions.label")}{" "}
                  {/* <span className='text-gray-500 text-xs'>
										({t("optional")}) 
									</span> */}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.number_of_questions ?? ""}
                  defaultValue={5}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setFormData({
                        ...formData,
                        number_of_questions: null,
                      });
                      return;
                    }

                    const num = Number(value);

                    if (num >= 1 && num <= 30) {
                      setFormData({
                        ...formData,
                        number_of_questions: num,
                      });
                    }
                  }}
                  onBlur={(e) => {
                    // agar bo‘sh qoldirilsa — default 6
                    if (e.target.value === "") {
                      setFormData({
                        ...formData,
                        number_of_questions: null,
                      });
                    }
                  }}
                  className="w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={
                    t("vacancyForm.numberOfQuestions.placeholder") || "1-30"
                  }
                />
              </div>
            </div>
            {/* Acceptance rate* and Position Level (Junior / Middle / Senior) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.positionRole.label")}
                </label>

                <Select
                  value={formData.position_role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, position_role: value })
                  }
                >
                  <SelectTrigger className="w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center">
                    <SelectValue placeholder="Junior / Middle / Senior" />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0a1b30] text-white border border-white/10">
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Middle">Middle</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between px-2 items-center">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 ">
                    {t("vacancyForm.acceptanceRate") ||
                      "Qabul qilish darajasi (%)"}
                  </label>
                  <span className="text-xs text-gray-500">1 - 100</span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder={t("vacancyForm.placeholders.acceptanceRate")}
                    value={formData.acceptance_rate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val === "" ||
                        (Number(val) >= 0 && Number(val) <= 100)
                      ) {
                        setFormData({
                          ...formData,
                          acceptance_rate: Number(val),
                        });
                      }
                    }}
                    className="w-full min-h-[48px]   px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="flex">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 ]">
                  {t("vacancyForm.workExperience.label")} *
                </label>
                <div className="flex flex-wrap gap-3">
                  {WorkExprerience.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border  transition-all cursor-pointer ${
                        formData.work_experiance === option.value
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-[#0a1b30]/50 border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={formData.work_experiance === option.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            work_experiance: e.target.value,
                          })
                        }
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <label className="block text-sm font-medium text-gray-300">
                {t("vacancyForm.workShift.label") || "Ish smenasi"}{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                {WORK_SHIFTS.map((shift) => {
                  const isSelected = formData.work_shifts.includes(shift.value);

                  return (
                    <div
                      key={shift.key}
                      onClick={() => toggleShift(shift.value)} // ✅ value yuboramiz
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? "bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "bg-transparent border-white/10 text-gray-400 hover:border-white/20"
                        }
                    `}
                    >
                      {/* <div className={`w-5 h-5 rounded border ${isSelected ? "bg-blue-500" : ""}`} /> */}
                      <div
                        className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-all
                        ${isSelected ? "bg-blue-500 border-blue-500" : "border-white/30"}
                    `}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      <span className="text-sm font-medium">
                        {t(shift.labelKey)} {/* 🌍 tilga qarab chiqadi */}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block text-sm font-medium text-gray-300">
                {t("vacancyForm.languageLevel.label") || "Til bilish darajasi"}
              </label>

              {formData.languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 animate-in fade-in duration-300"
                >
                  {/* Tilni tanlash */}
                  <div className="flex-1">
                    <Select
                      value={lang.name}
                      onValueChange={(val) =>
                        updateLanguage(index, "name", val)
                      }
                    >
                      <SelectTrigger className="w-full h-[50px] bg-transparent border border-white/10 rounded-xl text-white">
                        <SelectValue
                          placeholder={t(
                            "vacancyForm.placeholders.languagePlaceholder",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1b30] text-white border-white/10">
                        {SelectLanguages.map((language, index) => (
                          <SelectItem key={index} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Darajani tanlash */}
                  <div className="flex-1">
                    <Select
                      value={lang.level}
                      onValueChange={(val) =>
                        updateLanguage(index, "level", val)
                      }
                    >
                      <SelectTrigger className="w-full h-[50px] bg-transparent border border-white/10 rounded-xl text-white">
                        <SelectValue
                          placeholder={t(
                            "vacancyForm.placeholders.levelPlaceholder",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1b30] text-white border-white/10">
                        <SelectItem value="Boshlang'ich (A1-A2)">
                          {t("vacancyForm.languageLevels.beginner")}
                        </SelectItem>
                        <SelectItem value="O'rta (B1-B2)">
                          {t("vacancyForm.languageLevels.intermediate")}
                        </SelectItem>
                        <SelectItem value="Yuqori (C1-C2)">
                          {t("vacancyForm.languageLevels.advanced")}
                        </SelectItem>
                        <SelectItem value="Ona tili">
                          {t("vacancyForm.languageLevels.native")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* O'chirish tugmasi */}
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {/* Til qo'shish tugmasi */}
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-2 px-4 py-2  border border-white/10 text-white rounded-lg transition-all text-sm font-medium mt-2"
              >
                <Plus size={18} />
                {t("vacancyForm.addLanguage") || "Til qo'shish"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 pt-2">
              {/* Video Checkbox */}
              <label className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="has_video"
                    checked={formData.has_video || false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        has_video: !prev.has_video,
                        vakansiya_type: !prev.has_video
                          ? prev.has_widget
                            ? "both"
                            : "video"
                          : prev.has_widget
                            ? "widget"
                            : "video",
                      }))
                    }
                    className="hidden"
                  />
                  {/* <div className='w-5 h-5 rounded border-2 border-blue-400 bg-transparent flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50'>
										<svg
											className='w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={3}
												d='M5 13l4 4L19 7'
											/>
										</svg>
									</div> */}
                  <div
                    className={`
        w-5 h-5 rounded border flex items-center justify-center transition-all
        ${formData.has_video ? "bg-blue-500 border-blue-500" : "border-white/30"}
      `}
                  >
                    {formData.has_video && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-200">Video</span>
              </label>
              {/* Widget Checkbox */}
              <label className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="has_widget"
                    checked={formData.has_widget || false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        has_widget: !prev.has_widget,
                        vakansiya_type: !prev.has_widget
                          ? prev.has_video
                            ? "both"
                            : "widget"
                          : prev.has_video
                            ? "video"
                            : "widget",
                      }))
                    }
                    className="hidden"
                  />
                  <div
                    className={`
        w-5 h-5 rounded border flex items-center justify-center transition-all
        ${formData.has_widget ? "bg-blue-500 border-blue-500" : "border-white/30"}
      `}
                  >
                    {formData.has_widget && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-200">
                  Widget
                </span>
              </label>
            </div>
            <div>
              <div className="w-full space-y-2 relative" ref={containerRef}>
                <div className="flex justify-between px-2 mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {t("rightSection.skills")}
                  </label>
                </div>

                <div className="w-full relative">
                  {/* Multi-select Container */}
                  <div
                    className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border transition-all duration-300 ${
                      onFocusSkillInput
                        ? "border-blue-500 bg-[#0a1b30]/80"
                        : "border-white/10 bg-[#0a1b30]/50"
                    }`}
                  >
                    {/* Tanlangan skillar */}
                    {selectSkills.map((skill, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation(); // Container focusini buzmaslik uchun
                          removeSelectSkill(skill);
                        }}
                        className="flex items-center gap-1.5 cursor-pointer px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm border border-blue-500/30 hover:bg-red-500/10 hover:border-red-500/30 group transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          className="group-hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Input */}
                    <input
                      className="flex-1 min-w-[120px] bg-transparent text-white outline-none py-1"
                      placeholder={
                        selectSkills.length === 0
                          ? t("vacancyForm.placeholders.skillInput")
                          : ""
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onFocus={() => setOnFocusSkillInput(true)}
                      onKeyDown={handleKeyDown}
                    />

                    {/* Hammasini tozalash */}

                    {selectSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectSkills([]);
                          setFormData((prev) => ({ ...prev, required: "" }));
                        }}
                        className="absolute right-3 top-5 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={18} /> {/* Lucide-react yoki boshqa ikonka */}
                      </button>
                    )}
                  </div>

                  {/* Taklif qilinadigan skillar (Dropdown) */}
                  {onFocusSkillInput && (
                    <div className="absolute z-50 mt-2 w-full flex flex-wrap bg-[#0d1e35] p-3 gap-2 max-h-[30vh] overflow-y-auto rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
                      {allSkills
                        .filter((s) => !selectSkills.includes(s))
                        .filter((s) =>
                          s.toLowerCase().includes(inputValue.toLowerCase()),
                        )
                        .map((skill, index) => (
                          <div
                            onClick={() => handleSelectSkill(skill)}
                            key={index}
                            className="px-3 py-1.5 text-sm cursor-pointer bg-white/5 hover:bg-blue-600/40 text-gray-300 hover:text-white rounded-lg transition-all border border-transparent hover:border-blue-500/50"
                          >
                            {skill}
                          </div>
                        ))}

                      {/* Agar ro'yxatda yo'q bo'lsa yangi qo'shish */}
                      {inputValue &&
                        !allSkills.some(
                          (s) => s.toLowerCase() === inputValue.toLowerCase(),
                        ) && (
                          <div
                            onClick={() => handleSelectSkill(inputValue)}
                            className="w-full px-3 py-1.5 text-sm cursor-pointer bg-green-600/10 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-600/20 transition-all"
                          >
                            +{" "}
                            {t("vacancyForm.placeholders.addNewSkill", {
                              skill: inputValue,
                            })}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tanlash uchun barcha ko'nikmalar */}
              {onFocusSkillInput && (
                <div className="w-full flex flex-wrap bg-[#0a1b30]/80 p-3 gap-2 max-h-[30vh] overflow-y-auto rounded-lg border border-white/5 transition-all duration-300">
                  {allSkills.map((skill, index) => (
                    <div
                      onClick={() => handleSelectSkill(skill)}
                      key={index}
                      className={`p-2 text-sm cursor-pointer rounded-lg transition-colors ${
                        selectSkills.includes(skill)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500/10 text-gray-300 hover:bg-gray-500/30"
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.regions.region")}
                </label>

                <Select
                  value={formData.region}
                  // onValueChange={value =>
                  // 	setFormData({ ...formData, region: value })
                  // }
                  onValueChange={(value) =>
                    setFormData({ ...formData, region: value, district: "" })
                  }
                >
                  <SelectTrigger className="w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center">
                    <SelectValue
                      placeholder={t("vacancyForm.regions.region")}
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0a1b30] text-white border border-white/10">
                    {/* <SelectItem value='Intern'>Intern</SelectItem> */}
                    {Object.keys(address).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {t("vacancyForm.regions.district")}
                </label>

                <Select
                  value={formData.district}
                  onValueChange={(value) =>
                    setFormData({ ...formData, district: value })
                  }
                  disabled={!formData.region} // region tanlanmagan bo‘lsa, dropdown disable
                >
                  <SelectTrigger className="w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center">
                    <SelectValue
                      placeholder={t("vacancyForm.regions.district")}
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0a1b30] text-white border border-white/10">
                    {formData.region &&
                      address[formData.region as keyof typeof address].map(
                        (district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ),
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full flex flex-col mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("vacancyForm.placeholders.locationInfo")}
                <span className="text-red-500">*</span>
              </label>

              <div className="flex w-full gap-2">
                {/* Input */}
                <input
                  type="text"
                  readOnly={true}
                  value={formData.address}
                  // onChange={e =>
                  // 	setFormData({ ...formData, address: e.target.value })
                  // }
                  className="flex-1 px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white placeholder-gray-400 outline-none"
                />

                {/* Map Button */}
                <button
                  type="button"
                  onClick={() => setIsMapOpenModel(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5" /> {/* Icon o‘rniga MapPin */}
                </button>
              </div>
            </div>

            {/* Can students also hire job */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 pt-2">
              <label className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="students"
                    checked={formData.students || false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        students: !prev.students, // To'g'ri yozilish usuli
                      }))
                    }
                    className="hidden"
                  />
                  <div
                    className={`
        w-5 h-5 rounded border flex items-center justify-center transition-all
        ${formData.students ? "bg-blue-500 border-blue-500" : "border-white/30"}
      `}
                  >
                    {formData.students && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {t("rightSection.studentsCanApply")}
                </span>
              </label>
            </div>
            {/* Required Questions */}

            <RichEditor
              label={t("vacancyForm.requiredQuestion.label")}
              placeholder={
                t("vacancyForm.requiredQuestion.placeholder") ||
                "Savollarni yozing (har bir savol yangi qatordan boshlansin)..."
              }
              value={formData.required_question || ""}
              onChange={(html) =>
                setFormData({ ...formData, required_question: html })
              }
            >
              <button
                type="button"
                value={formData.required_question}
                onClick={handleGenerateQuestionAi}
                className=" px-4 py-2 text-white bg-purple-600 rounded-lg absolute top-0.5 right-1 cursor-pointer disabled"
              >
                {t("vacancyForm.requiredQuestion.label")}
              </button>
            </RichEditor>
            <RichEditor
              label={t("vacancyForm.description.label")}
              placeholder="Ish tavsifi..."
              value={formData.description}
              onChange={(html) =>
                setFormData({ ...formData, description: html })
              }
            >
              <button
                type="button"
                onClick={handleGenerateDescriptionAI}
                disabled={isGenerating || !selectedSite}
                className=" px-4 py-2 text-white bg-purple-600 rounded-lg absolute top-0.5 right-1 cursor-pointer"
              >
                {isGenerating
                  ? t("vacancyForm.generatingDescription")
                  : t("vacancyForm.generateDescription")}
              </button>
            </RichEditor>
            {/* 7. AI Description */}
            <div className="gap-3 sm:gap-2 pt-6">
              <div className="flex justify-end gap-2">
                <button
                  type="reset"
                  // onClick={onClose}
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 text-gray-300 bg-[#0a1b30]/50 rounded-xl cursor-pointer"
                >
                  {t("vacancyForm.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isLoading || isGenerating || isGeneratingQuestion}
                  className="px-5 py-3 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-xl"
                >
                  {isLoading
                    ? t("vacancyForm.submitSaving")
                    : t("vacancyForm.submitSave")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <RightSection formData={formData} selectedSite={selectedSite} />
      {/* // AI dan kelgan descriptionni tasdiqlash oynasini */}

      {/* AI Tasdiqlash Modali */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a1b30] border border-white/10 w-full  max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-semibold text-white">
                {t("vacancyForm.aiModal.descriptionTitle")}
              </h3>
              <div className="gap-3 flex">
                <button
                  disabled={isGenerating}
                  onClick={handleGenerateDescriptionAI}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95
                    ${isGenerating ? "text-green-500 bg-green-500/10 border-green-500/50 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"}
                `}
                >
                  <RefreshCw
                    size={18}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  <span>
                    {isGenerating ? "Yaratilmoqda..." : "Qayta yaratish"}
                  </span>
                </button>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Matnni ko'rish uchun */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isGenerating ? (
                <Skeleton
                  active
                  paragraph={{
                    rows: 6,
                    width: ["100%", "90%", "95%", "80%", "90%", "40%"],
                  }}
                />
              ) : (
                <div className="animate-in fade-in duration-1000 text-gray-200 h-full text-sm leading-relaxed whitespace-pre-line prose prose-invert ">
                  <div
                    dangerouslySetInnerHTML={{ __html: tempGeneratedText }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-xl transition-colors"
              >
                {t("vacancyForm.cancel")}
              </button>
              <button
                disabled={isGenerating}
                type="button"
                onClick={handleConfirmText}
                className={`px-6 py-2 text-sm rounded-xl transition-all shadow-lg shadow-green-900/20 ${
                  isGenerating
                    ? "text-green-500 bg-green-500/10 border-green-500/50 cursor-not-allowed"
                    : "font-medium bg-green-600 hover:bg-green-700 text-white "
                }`}
              >
                {t("vacancyForm.saveAndAccept")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a1b30] border border-white/10 w-full  max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-semibold text-white">
                {t("vacancyForm.aiModal.questionsTitle")}
              </h3>
              <div className="gap-3 flex">
                <button
                  disabled={isGenerating}
                  onClick={handleGenerateQuestionAi}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95
                    ${isGenerating ? "text-green-500 bg-green-500/10 border-green-500/50 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"}
                `}
                >
                  <RefreshCw
                    size={18}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  <span>
                    {isGenerating ? "Yaratilmoqda..." : "Qayta yaratish"}
                  </span>
                </button>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Matnni ko'rish uchun */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isGenerating ? (
                <Skeleton
                  active
                  paragraph={{
                    rows: 6,
                    width: ["100%", "90%", "95%", "80%", "90%", "40%"],
                  }}
                />
              ) : (
                <div className="animate-in fade-in duration-1000 text-gray-200 h-full text-sm leading-relaxed whitespace-pre-line prose prose-invert ">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: tempGeneratedQuestionText,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-xl transition-colors"
              >
                {t("vacancyForm.cancel")}
              </button>
              <button
                disabled={isGenerating}
                type="button"
                onClick={handleSaveQuestion}
                className={`px-6 py-2 text-sm rounded-xl transition-all shadow-lg shadow-green-900/20 ${
                  isGenerating
                    ? "text-green-500 bg-green-500/10 border-green-500/50 cursor-not-allowed"
                    : "font-medium bg-green-600 hover:bg-green-700 text-white "
                }`}
              >
                {t("vacancyForm.saveAndAccept")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Map Model */}

      {isMapOpenModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0a1b30] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {t("vacancyForm.location.title")}
              </h3>
              <button
                onClick={() => setIsMapOpenModel(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Xarita */}
            <div className="px-6 pb-2 relative">
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner h-[400px]">
                {/* <Map
									onLocationSelect={handleLocationSelect}
									initialCoords={
										formData.coords.lat && formData.coords.long
											? [formData.coords.lat, formData.coords.long]
											: ["41.2995", "69.2401"]
									}
								/> */}
                <Map
                  initialCoords={
                    formData.coords?.lat
                      ? [
                          Number(formData.coords.lat),
                          Number(formData.coords.long),
                        ]
                      : [41.2995, 69.2401]
                  }
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleClearLoactionInfo}
                className="flex-1 py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-2xl transition-all"
              >
                {t("vacancyForm.location.clear")}
              </button>
              <button
                type="button"
                onClick={() => setIsMapOpenModel(false)}
                className="flex-1 py-3 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white font-bold rounded-2xl shadow-lg  transition-all"
              >
                {t("vacancyForm.location.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVacancyPage;
