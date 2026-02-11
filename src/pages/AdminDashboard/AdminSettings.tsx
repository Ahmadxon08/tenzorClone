import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Settings,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { ApiUser } from '../../services/api';
import { apiService } from '../../services/api';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [editEmail, setEditEmail] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("access_token") || "";

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const data = await apiService.me(token);
      setUserData(data);
      setEditEmail(data.email || '');
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(t("error.fetchFailed") || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRefresh = () => {
    fetchUserData();
    toast.info(t("settingsPage.refreshed") || "Ma'lumotlar yangilandi");
  };

  const validateCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      toast.error(t("settingsPage.password.currentRequired") || "Joriy parolni kiriting");
      return false;
    }
    setValidating(true);
    try {
      const response = await apiService.validatePassword(token, currentPassword);
      const valid = response.detail.valid
      setPasswordValid(valid);
      
      if (valid) {
        toast.success(t("settingsPage.password.valid") || "Parol to'g'ri");
        return true;
      } else {
        toast.error(t("settingsPage.password.invalid") || "Joriy parol noto'g'ri");
        setCurrentPassword('');
        return false;
      }
    } catch (error) {
      console.error("Password validation error:", error);
      toast.error(t("settingsPage.password.validationError") || "Parolni tekshirishda xatolik");
      return false;
    } finally {
      setValidating(false);
    }
  };

  console.log("valid", passwordValid);
  

  const handleUpdateProfile = async () => {
    if (!editEmail) {
      toast.error(t("settingsPage.profile.emailRequired") || "Email kiritish kerak");
      return;
    }
    if (newPassword || confirmPassword) {
      if (!passwordValid) {
        toast.error(t("settingsPage.password.validateFirst") || "Avval joriy parolni tasdiqlang");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(t("settingsPage.password.mismatch") || "Yangi parollar mos kelmaydi");
        return;
      }
      if (newPassword.length < 6) {
        toast.error(t("settingsPage.password.minLength") || "Yangi parol kamida 6 belgidan iborat bo'lishi kerak");
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        email: editEmail,
        ...(newPassword && { password: newPassword }),
        sites: userData?.sites?.map(site => ({
          site_id: site.site_id || site.domain_id,
          site_name: site.site_name,
          domain_id: site.domain_id,
          domain: site.site_domain
        })) || []
      };
      // @ts-ignore backend shape
      const result = await apiService.updateProfile(token, updateData);
      setUserData(result);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setPasswordValid(null);
      toast.success(t("settingsPage.updateSuccess") || "Profil muvaffaqiyatli yangilandi");
      await fetchUserData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`${t("settingsPage.updateFailed") || "Profilni yangilashda xatolik"}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordValidation = async () => {
    const isValid = await validateCurrentPassword();
    if (isValid) setPasswordValid(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400">{t("common.loading") || "Yuklanmoqda..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("settingsPage.header.title") || "Sozlamalar"}
          </h1>
          <p className="text-gray-400 mt-1">
            {t("settingsPage.header.subtitle") || "Akkaunt va tizim sozlamalari"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a1b30]/50 hover:bg-[#0a1b30]/70 border border-white/10 rounded-xl text-white transition-all"
          >
            <RefreshCw size={18} />
            {t("common.refresh") || "Yangilash"}
          </button>
        </div>
      </div>

      {/* Two column layout: left content, right sticky summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT — main content */}
        <div className="space-y-6 xl:col-span-2">
          {/* Profile card */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <User size={22} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.profile.title") || "Profil ma'lumotlari"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.profile.subtitle") || "Sizning shaxsiy ma'lumotlaringiz"}
                </p>
              </div>
            </div>

            {/* body */}
            <div className="p-6 space-y-6">
              {/* Row: Email (inline label layout) */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  {t("settingsPage.profile.email") || "Email"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <input
                    type="email"
                    disabled
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full max-w-[520px] bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                    placeholder={t("settingsPage.profile.emailPlaceholder") || "Email manzilingizni kiriting"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("settingsPage.profile.emailHelp") || "Login va bildirishnomalar shu email orqali ketadi."}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-white/10" />

              {/* Row: User Type */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  {t("settingsPage.profile.userType") || "Foydalanuvchi turi"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <p className="text-white font-medium capitalize">
                    {t(`userTypes.${userData?.type || "owner"}`) || (userData?.type || "Owner")}
                  </p>
                </div>
              </div>

              {/* Row: User ID */}
              <div className="grid grid-cols-12 items-center gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400 flex items-center gap-2">
                  <Settings size={16} className="text-gray-500" />
                  {t("settingsPage.profile.userId") || "Foydalanuvchi ID"}
                </label>
                <div className="col-span-12 md:col-span-8">
                  <p className="text-white font-medium">#{userData?.id}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                {/* <button
                  onClick={handleUpdateProfile}
                  disabled={saving || !userData?.id}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  <Save size={18} className={saving ? "animate-spin" : ""} />
                  {saving ? (t("common.saving") || "Saqlanmoqda...") : (t("settingsPage.profile.save") || "Saqlash")}
                </button> */}
              </div>
            </div>
          </div>

          {/* Password card */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Lock size={22} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.password.title") || "Parol o'zgartirish"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.password.subtitle") || "Xavfsizlik uchun parolingizni yangilang"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current password row (inline) */}
              <div className="grid grid-cols-12 items-start gap-4">
                <label className="col-span-12 md:col-span-4 text-sm text-gray-400">
                  {t("settingsPage.password.current") || "Joriy parol"}
                </label>
                <div className="col-span-12 md:col-span-8 max-w-[520px]">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t("settingsPage.password.currentPlaceholder") || "Joriy parolingizni kiriting"}
                      className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-blue-500/50 outline-none transition-all pr-10"
                      disabled={validating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={validating}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        t("settingsPage.password.validate") || "Parolni tasdiqlash"
                      )}
                    </button>

                    {passwordValid === true && (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        {t("settingsPage.password.validated") || "Parol tasdiqlandi"}
                      </span>
                    )}
                    {passwordValid === false && (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {t("settingsPage.password.invalidated") || "Parol noto'g'ri"}
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
                    <div className="relative max-w-[520px]">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("settingsPage.password.newPlaceholder") || "Yangi parolingizni kiriting (min. 6 belgi)"}
                        className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-green-500/50 outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <p className="mt-1 text-red-400 text-xs">
                        {t("settingsPage.password.minLengthError") || "Parol kamida 6 belgidan iborat bo'lishi kerak"}
                      </p>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="col-span-12 md:col-span-6">
                    <label className="text-sm text-gray-400 block mb-2">
                      {t("settingsPage.password.confirm") || "Parolni tasdiqlash"}
                    </label>
                    <div className="relative max-w-[520px]">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("settingsPage.password.confirmPlaceholder") || "Yangi parolni qayta kiriting"}
                        className="w-full bg-[#0a1b30]/50 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-green-500/50 outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {t("settingsPage.password.mismatchError") || "Parollar mos kelmaydi"}
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  <Save size={18} className={saving ? "animate-spin" : ""} />
                  {saving ? (t("common.saving") || "Saqlanmoqda...") : (t("settingsPage.profile.save") || "Saqlash")}
                </button>
              </div>
            </div>
          </div>

          {/* Sites */}
          <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Building2 size={22} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("settingsPage.sites.title") || "Saytlar"}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("settingsPage.sites.subtitle") || "Sizning ulangan saytlaringiz"}
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
                          <h3 className="text-white font-medium mb-1 truncate">{site.site_name}</h3>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-400 truncate">
                              <span className="text-gray-500">{t("settingsPage.sites.domain") || "Domain"}:</span>{" "}
                              <span className="text-gray-300">{site.site_domain}</span>
                            </p>
                            <p className="text-gray-400 truncate">
                              <span className="text-gray-500">{t("settingsPage.sites.publicKey") || "Public Key"}:</span>{" "}
                              <span className="text-gray-300 font-mono">{site.public_key}</span>
                            </p>
                            <p className="text-gray-400">
                              <span className="text-gray-500">{t("settingsPage.sites.siteId") || "Site ID"}:</span>{" "}
                              <span className="text-gray-300">{site.site_id || site.domain_id}</span>
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
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-5">
            <span className="text-sm text-gray-400 block">
              {t("settingsPage.stats.totalSites") || "Jami saytlar"}
            </span>
            <p className="text-3xl font-bold text-white mt-1">
              {userData?.sites?.length || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5">
            <span className="text-sm text-gray-400 block">
              {t("settingsPage.stats.accountType") || "Akkaunt turi"}
            </span>
            <p className="text-2xl font-bold text-white capitalize mt-1">
              {userData?.type || "Owner"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-5">
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
