// src/pages/auth/register/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schema/auth.error";
import type { z } from "zod";
import Language from "../../../components/LanguageSelector";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiService } from "../../../services/api";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await apiService.registerOwner(data as any);
      if (response) {
        toast.success(t("register.success") || "Verification sent", {});
        navigate("/set-code", { state: { phoneNumber: data.phoneNumber } });
      } else {
        toast.error(t("register.error") || "Failed to register", {});
      }
    } catch (err: any) {
      toast.error(
        err?.detail ||
          t("register.error") ||
          "Failed to send verification code",
      );
    }
  };

  const onError = (errs: any) => {
    if (errs?.fullName) {
      toast.error(errs.fullName.message, {});
      return;
    }
    if (errs?.phoneNumber) {
      toast.error(errs.phoneNumber.message, {});
      return;
    }
    if (errs?.password) {
      toast.error(errs.password.message, {});
      return;
    }
    if (errs?.confirmPassword) {
      toast.error(errs.confirmPassword.message);
      return;
    }
    if (errs?.companyName) {
      toast.error(errs.companyName.message);
      return;
    }
    if (errs?.description) {
      toast.error(errs.description.message);
      return;
    }
    if (errs?.tokenDuration) {
      toast.error(errs.tokenDuration.message);
      return;
    }
  };

  const goToLogin = () => navigate("/login");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background:
          "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
      }}
    >
      <div className="absolute top-4 right-4">
        <Language />
      </div>

      <div className="max-w-md w-full">
        <div
          className="flex justify-center items-center mb-5 cursor-pointer"
          onClick={() => (window.location.href = "https://jobx.uz/")}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {t("register.brand")}
            <span
              className="inline-block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-gray-500 animate-pulse via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x"
              style={{
                transform: "rotateY(-25deg) skewY(-10deg)",
                display: "inline-block",
              }}
            >
              {t("register.brandX")}
            </span>
          </h1>
        </div>

        <div className="parentDivForm">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div>
              <label className="label">{t("register.fullName")}</label>
              <input
                {...register("fullName")}
                placeholder={t("register.fullNamePlaceholder") as string}
                className={"input"}
              />
            </div>

            <div>
              <label className="label">{t("register.phoneNumber")}</label>
              <input
                {...register("phoneNumber")}
                placeholder={t("register.phonePlaceholder") as string}
                className={cn("input")}
                autoComplete="tel"
                defaultValue="+998"
              />
              {errors.phoneNumber && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">{t("register.password")}</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("register.passwordPlaceholder") as string}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">{t("register.confirmPassword")}</label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={
                    t("register.confirmPasswordPlaceholder") as string
                  }
                  className={
                    errors.confirmPassword
                      ? "input border-destructive"
                      : "input"
                  }
                />
                <button
                  type="button"
                  onClick={() => setConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">{t("register.companyName")}</label>
              <input
                {...register("companyName")}
                placeholder={t("register.companyNamePlaceholder") as string}
                className={
                  errors.companyName ? "input border-destructive" : "input"
                }
              />
              {errors.companyName && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">{t("register.description")}</label>
              <textarea
                {...register("description")}
                className={
                  errors.description ? "input border-destructive" : "input"
                }
                placeholder={t("register.descriptionPlaceholder") as string}
              />
              {errors.description && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t("register.tokenDuration")}
              </label>
              <Controller
                control={control}
                name="tokenDuration"
                defaultValue="DAY"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn("input")}>
                      <SelectValue>
                        {field.value
                          ? field.value
                          : t("register.tokenDurationPlaceholder")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className="
    
    backdrop-blur-md 
    border border-white/10 
    text-white
  "
                    >
                      <SelectItem value="DAY">1 kun</SelectItem>
                      <SelectItem value="WEEK">1 hafta</SelectItem>
                      <SelectItem value="MONTH">1 oy</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tokenDuration && (
                <p className="text-sm mt-1 pr-0.5 text-red-400 text-destructive">
                  {errors.tokenDuration.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Creating..." : t("register.submit")}
            </button>
          </form>
          <div className="mt-6 flex justify-around items-center text-center">
            <p className="text-white/80 text-sm mb-1">
              {t("register.haveAccount")}
            </p>
            <button
              onClick={goToLogin}
              className="text-white hover:text-gray-200 font-medium transition-colors underline cursor-pointer"
            >
              {t("register.goToLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
