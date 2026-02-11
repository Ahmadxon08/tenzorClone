// src/pages/Dashboard/SettingsPage.tsx
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  MapPin,
  RefreshCw,
  Save,
  Settings,
  User,
  MessageSquare,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
// import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { ApiUser } from "../../services/api";
import { apiService } from "../../services/api";
import LocationPicker from "./Applications/LocationInputMap";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";

// Default marker icon fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface CompanyInfo {
  name: string;
  contactNumber: string;
  location: string;
  coordinates: [number, number];
  smsTemplate: string;
}

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [editEmail] = useState("");
  const { user } = useAuth();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: user?.companyName || "",
    contactNumber: user?.phoneNumber || "",
    location: "Tashkent, Uzbekistan",
    coordinates: [41.2995, 69.2401],
    smsTemplate:
      "Hurmatli [candidate_name], sizni [company_name] kompaniyasining [position] lavozimiga suhbatga chaqiramiz. Suhbat vaqti: [interview_date], joyi: [location]. Iltimos, o'z vaqtida keling.",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const SMS_MAX_LENGTH = 185;

  const token = localStorage.getItem("access_token") || "";
  const hasToastShown = useRef(false);

  const location = useLocation();

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const data = await apiService.me(token);
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(t("error.fetchFailed") || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };
  const normalizeLocation = (loc: any): [number, number] => {
    if (Array.isArray(loc)) {
      if (
        loc.length === 2 &&
        typeof loc[0] === "number" &&
        typeof loc[1] === "number"
      ) {
        return [loc[0], loc[1]];
      }
    }

    if (typeof loc === "string") {
      const parts = loc.split(",").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }

    return [41.29855420527527, 69.33831194017175];
  };

  const fetchCompanyInfo = async () => {
    try {
      const data = await apiService.me(token);

      console.log("Data in setting page", data);

      setCompanyInfo({
        name: data.companyName || companyInfo.name,
        contactNumber: data.companyPhone || companyInfo.contactNumber,
        location: data.location || companyInfo.location,
        coordinates: normalizeLocation(data.location),
        smsTemplate: data.messageTemplate || companyInfo.smsTemplate,
      });
      setCompanyDescription(data.description || "");
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  useEffect(() => {
    if (location.state?.fromGuard && !hasToastShown.current) {
      const missing = location.state?.missingFields || [];

      if (missing.length === 0) {
        window.location.reload();
        return;
      }

      setIsModalOpen(true);

      hasToastShown.current = true;

      window.history.replaceState({}, document.title);
    }
  }, [location.state, t]);

  useEffect(() => {
    fetchUserData();
    fetchCompanyInfo();
  }, []);

  const handleRefresh = () => {
    fetchUserData();
    fetchCompanyInfo();
    toast.info(t("settingsPage.refreshed") || "Ma'lumotlar yangilandi");
  };

  const handleLocationChange = (address: string, coords: [number, number]) => {
    setCompanyInfo((prev) => ({
      ...prev,
      location: address,
      coordinates: coords,
    }));
  };
  const handleUpdateCompanyInfo = async () => {
    setSaving(true);
    try {
      await apiService.updateCompanyInfo(
        {
          company_name: companyInfo.name,
          company_phone: companyInfo.contactNumber,
          location: companyInfo.coordinates,
          message_template: companyInfo.smsTemplate,
          description: companyDescription,
        },
        token,
      );

      toast.success("Kompaniya ma'lumotlari muvaffaqiyatli yangilandi");
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      await fetchCompanyInfo();
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating company info:", error);
      toast.error("Xatolik: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploading(true);

      const res = await apiService.UpdateLogo(token, file);

      if (res?.companyLogo) {
        setUserData((prev: any) => ({
          ...prev,
          companyLogo: res.companyLogo,
        }));
      }

      toast.success("Logo muvaffaqiyatli yuklandi!");
    } catch (err) {
      console.error(err);
      toast.error("Logo yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const validateCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      toast.error(
        t("settingsPage.password.currentRequired") || "Joriy parolni kiriting",
      );
      return false;
    }
    setValidating(true);
    try {
      const response = await apiService.validatePassword(
        token,
        currentPassword,
      );
      const valid = response.detail.valid;
      setPasswordValid(valid);

      if (valid) {
        toast.success(t("settingsPage.password.valid") || "Parol to'g'ri");
        return true;
      } else {
        toast.error(
          t("settingsPage.password.invalid") || "Joriy parol noto'g'ri",
        );
        setCurrentPassword("");
        return false;
      }
    } catch (error) {
      console.error("Password validation error:", error);
      toast.error(
        t("settingsPage.password.validationError") ||
          "Parolni tekshirishda xatolik",
      );
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editEmail) {
      toast.error(
        t("settingsPage.profile.emailRequired") || "Email kiritish kerak",
      );
      return;
    }
    if (newPassword || confirmPassword) {
      if (!passwordValid) {
        toast.error(
          t("settingsPage.password.validateFirst") ||
            "Avval joriy parolni tasdiqlang",
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(
          t("settingsPage.password.mismatch") || "Yangi parollar mos kelmaydi",
        );
        return;
      }
      if (newPassword.length < 6) {
        toast.error(
          t("settingsPage.password.minLength") ||
            "Yangi parol kamida 6 belgidan iborat bo'lishi kerak",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        email: editEmail,
        ...(newPassword && { password: newPassword }),
        sites:
          userData?.sites?.map((site) => ({
            site_id: site.site_id || site.domain_id,
            site_name: site.site_name,
            domain_id: site.domain_id,
            domain: site.site_domain,
          })) || [],
      };
      // @ts-ignore backend shape
      const result = await apiService.updateProfile(token, updateData);
      setUserData(result);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordValid(null);
      toast.success(
        t("settingsPage.updateSuccess") || "Profil muvaffaqiyatli yangilandi",
      );
      await fetchUserData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        `${t("settingsPage.updateFailed") || "Profilni yangilashda xatolik"}: ${
          error.message
        }`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordValidation = async () => {
    const isValid = await validateCurrentPassword();
    if (isValid) setPasswordValid(true);
  };

  if (loading) {
    return <Loading />;
  }

  console.log("userData", userData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="headerForSetting">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("settingsPage.header.title") || "Sozlamalar"}
          </h1>
          <p className="text-gray-400 mt-1">
            {t("settingsPage.header.subtitle") ||
              "Akkaunt va tizim sozlamalari"}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleRefresh} className="refreshButton">
            <RefreshCw size={18} />
            {t("common.refresh") || "Yangilash"}
          </button>
        </div>
      </div>

      {/* Two column layout: left content, right sticky summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <div className="cardBg">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4">
              <div className="relative group w-14 h-14">
                <div className="relative group w-14 h-14">
                  {uploading ? (
                    <div className="w-14 h-14 rounded-full bg-[#0a1b30]/60 border border-white/10 flex items-center justify-center shadow-lg">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  ) : userData?.companyLogo ? (
                    <img
                      src={userData.companyLogo}
                      alt="Company Logo"
                      className="w-14 h-14 rounded-full object-cover border border-white/20 shadow-md bg-white/10"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center 
        bg-[#0a1b30]/60 border border-white/10 shadow-lg"
                    >
                      <User size={26} className="text-gray-300" />
                    </div>
                  )}

                  {/* --- BADGE AREA --- */}
                  {userData?.companyLogo ? (
                    <button
                      onClick={async () => {
                        try {
                          setUploading(true);
                          await apiService.DeleteLogo(token);

                          setUserData((prev: any) => ({
                            ...prev,
                            companyLogo: null,
                          }));

                          toast.success("Logo o‘chirildi");
                        } catch (err) {
                          console.error(err);
                          toast.error("Logo o‘chirishda xatolik yuz berdi");
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="badgeButton"
                      title="Logoni o‘chirish"
                    >
                      🗑
                    </button>
                  ) : (
                    <>
                      <label
                        htmlFor="companyLogoInput"
                        className="companyLogoLabel"
                        title="Logoni yuklash"
                      >
                        +
                      </label>

                      <input
                        type="file"
                        id="companyLogoInput"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.profile.title") || "Profil ma'lumotlari"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.profile.subtitle") ||
                    "Sizning shaxsiy ma'lumotlaringiz"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  Phone
                </label>
                <div className="col-span-12 md:col-span-8">
                  <input
                    type="tel"
                    disabled
                    value={userData?.phoneNumber}
                    className="w-full max-w-130 bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                    placeholder={"telefon numer"}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    {t("settingsPage.profile.emailHelp") ||
                      "Login va bildirishnomalar shu telefon numer orqali ketadi."}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-white/10" />

              {/* Row: User Type */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="userTypeLabel">
                  <Building2 size={16} className="text-gray-500" />
                  {t("settingsPage.profile.userType") || "Foydalanuvchi turi"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <p className="text-white font-medium capitalize">
                    {userData?.role}
                  </p>
                </div>
              </div>

              {/* Row: User ID */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="userTypeLabel">
                  <Settings size={16} className="text-gray-500" />
                  {t("settingsPage.profile.userId") || "Foydalanuvchi ID"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <p className="text-white font-medium">#{userData?.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="cardBg">
            <div className="px-6 py-5 flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Building2 size={22} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.company.title") || "Kompaniya ma'lumotlari"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.company.subtitle") ||
                    "Kompaniya kontakt va joylashuvi"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 flex flex-col">
              <label className="text-sm text-gray-400 block mb-1">
                {}
                {t("settingsPage.company.description") || "Kompaniya tavsifi"}
              </label>
              <textarea
                value={userData?.description}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder={
                  t("settingsPage.company.descriptionPlaceholder") ||
                  "Tavsif kiriting"
                }
                className="w-full max-w-130 h-32 bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all resize-none"
              />

              <button
                onClick={handleUpdateCompanyInfo}
                disabled={saving}
                className="w-36 items-center gap-2 px-5 py-2.5 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
              >
                {saving
                  ? t("common.saving") || "Saqlanmoqda..."
                  : t("common.save") || "Saqlash"}
              </button>
            </div>
          </div>

          <div className="cardBg">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Building2 size={22} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.sms.title") || "Kompaniya ma'lumotlari"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.company.subtitle") ||
                    "Kompaniya kontakt va joylashuvi"}
                </p>
              </div>
            </div>

            {/* body */}
            <div className="p-6 space-y-6">
              {/* Row: Company Name */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  {t("settingsPage.company.name") || "Kompaniya nomi"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder={
                      t("settingsPage.company.namePlaceholder") ||
                      "Kompaniya nomi"
                    }
                    className="w-full max-w-130 bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-white/10" />

              {/* Row: Contact Number */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  {t("settingsPage.company.phone") || "Telefon raqami"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <input
                    type="text"
                    value={companyInfo.contactNumber}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    placeholder={
                      t("settingsPage.company.phonePlaceholder") ||
                      "Telefon raqami"
                    }
                    className="w-full max-w-130 bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-white/10" />

              {/* Row: SMS Template */}
              <div className="grid grid-cols-12 items-start gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <MessageSquare size={18} className="text-gray-500" />
                  SMS Template
                </label>

                <div className="col-span-12 md:col-span-8 space-y-3">
                  <textarea
                    value={companyInfo.smsTemplate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCompanyInfo((prev) => ({
                        ...prev,
                        smsTemplate: value,
                      }));
                    }}
                    className={`w-full max-w-130 h-40 px-3 py-3 rounded-lg border 
    ${
      companyInfo.smsTemplate.length > SMS_MAX_LENGTH
        ? "border-red-500"
        : "border-white/10"
    } 
    bg-[#0a1b30]/50 text-white focus:outline-none transition-all resize-none overflow-y-auto`}
                    placeholder="Write your default SMS template here..."
                  />
                  <p
                    className={`text-xs mt-1 ${
                      companyInfo.smsTemplate.length > SMS_MAX_LENGTH
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {companyInfo.smsTemplate.length}/{SMS_MAX_LENGTH}{" "}
                    {companyInfo.smsTemplate.length > SMS_MAX_LENGTH
                      ? " - Limitni oshdingiz!"
                      : ""}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="p-4 sm:p-5 md:p-6 bg-[#0a1b30]/40 border border-white/10 rounded-xl shadow-lg space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [candidate_name]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.candidate_name")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [company_name]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.company_name")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [position]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.position")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [interview_date]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.interview_date")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [location]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.location")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      [company_phone]
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {t("settingsPage.placeholders.company_phone")}
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-500" />
                    {t("settingsPage.company.location") || "Joylashuvi"}
                  </label>

                  <LocationPicker
                    initialLocation={companyInfo.location}
                    initialCoords={companyInfo.coordinates}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleUpdateCompanyInfo}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
    bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
    text-white font-medium rounded-xl transition-all disabled:opacity-50 ml-auto"
                >
                  <Save size={18} className={saving ? "animate-spin" : ""} />
                  {saving ? t("common.saving") || "Saqlanmoqda..." : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Password card */}
          <div className="cardBg">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Lock size={22} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.password.title") || "Parol o'zgartirish"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.password.subtitle") ||
                    "Xavfsizlik uchun parolingizni yangilang"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current password row (inline) */}
              <div className="grid grid-cols-12 items-start gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400">
                  {t("settingsPage.password.current") || "Joriy parol"}
                </label>
                <div className="col-span-12 md:col-span-8 max-w-130">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={
                        t("settingsPage.password.currentPlaceholder") ||
                        "Joriy parolingizni kiriting"
                      }
                      className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all pr-10"
                      disabled={validating}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={validating}
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={handlePasswordValidation}
                      disabled={!currentPassword || validating}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-sm rounded transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {validating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          {t("common.verifying") || "Tekshirilmoqda..."}
                        </>
                      ) : (
                        t("settingsPage.password.validate") ||
                        "Parolni tasdiqlash"
                      )}
                    </button>

                    {passwordValid === true && (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        {t("settingsPage.password.validated") ||
                          "Parol tasdiqlandi"}
                      </span>
                    )}
                    {passwordValid === false && (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {t("settingsPage.password.invalidated") ||
                          "Parol noto'g'ri"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* New / Confirm (two-up only after validation) */}
              {passwordValid && (
                <div className="grid grid-cols-12 gap-4">
                  {/* New */}
                  <div className="col-span-12 md:col-span-6">
                    <label className="text-sm text-gray-400 block mb-2">
                      {t("settingsPage.password.new") || "Yangi parol"}
                    </label>
                    <div className="relative max-w-130">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={
                          t("settingsPage.password.newPlaceholder") ||
                          "Yangi parolingizni kiriting (min. 6 belgi)"
                        }
                        className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-green-500/50 outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <p className="mt-1 text-red-400 text-xs">
                        {t("settingsPage.password.minLengthError") ||
                          "Parol kamida 6 belgidan iborat bo'lishi kerak"}
                      </p>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="col-span-12 md:col-span-6">
                    <label className="text-sm text-gray-400 block mb-2">
                      {t("settingsPage.password.confirm") ||
                        "Parolni tasdiqlash"}
                    </label>
                    <div className="relative max-w-130">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={
                          t("settingsPage.password.confirmPlaceholder") ||
                          "Yangi parolni qayta kiriting"
                        }
                        className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-green-500/50 outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {newPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {t("settingsPage.password.mismatchError") ||
                            "Parollar mos kelmaydi"}
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Save at bottom as well (mobile UX) */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving || !userData?.id}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  <Save size={18} className={saving ? "animate-spin" : ""} />
                  {saving
                    ? t("common.saving") || "Saqlanmoqda..."
                    : t("settingsPage.profile.save") || "Saqlash"}
                </button>
              </div>
            </div>
          </div>

          {/* Sites */}
          <div className="cardBg">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Building2 size={22} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.sites.title") || "Saytlar"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.sites.subtitle") ||
                    "Sizning ulangan saytlaringiz"}
                </p>
              </div>
            </div>

            <div className="p-6">
              {userData?.sites && userData.sites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {userData.sites.map((site, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#0a1b30]/30 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-1 truncate">
                            {site.site_name}
                          </h3>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-400 truncate">
                              <span className="text-gray-500">
                                {t("settingsPage.sites.domain") || "Domain"}:
                              </span>{" "}
                              <span className="text-gray-300">
                                {site.site_domain.replace(/^https?:\/\//, "")}
                              </span>
                            </p>
                            <p className="text-gray-400 truncate">
                              <span className="text-gray-500">
                                {t("settingsPage.sites.publicKey") ||
                                  "Public Key"}
                                :
                              </span>{" "}
                              <span className="text-gray-300 font-mono">
                                {site.public_key}
                              </span>
                            </p>
                            <p className="text-gray-400">
                              <span className="text-gray-500">
                                {t("settingsPage.sites.siteId") || "Site ID"}:
                              </span>{" "}
                              <span className="text-gray-300">
                                {site.site_id || site.domain_id}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg shrink-0">
                          <span className="text-xs text-green-400 font-medium">
                            {t("settingsPage.sites.active") || "Faol"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {t("settingsPage.sites.noSites") || "Hozircha saytlar yo'q"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — sticky summary / stats */}
        <aside className="xl:col-span-1 xl:sticky xl:top-20 space-y-4 h-max">
          <div className="summaryBgBlue">
            <span className="summarySpan">
              {t("settingsPage.stats.totalSites") || "Jami saytlar"}
            </span>
            <p className="text-3xl font-bold text-white mt-1">
              {userData?.sites?.length || 0}
            </p>
          </div>

          <div className="summaryBgPurple">
            <span className="summarySpan">
              {t("settingsPage.stats.accountType") || "Akkaunt turi"}
            </span>
            <p className="text-2xl font-bold text-white capitalize mt-1">
              {userData?.type || "Owner"}
            </p>
          </div>

          <div className="summaryBgGreen">
            <span className="text-sm text-gray-400 block">
              {t("settingsPage.stats.status") || "Status"}
            </span>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {t("settingsPage.stats.active") || "Faol"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SettingsPage;
