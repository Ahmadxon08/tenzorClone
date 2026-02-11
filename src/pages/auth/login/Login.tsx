// pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../contexts/AuthContext";
import LanguageSelector from "../../../components/LanguageSelector";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import GuestRoute from "../../../components/GuestRoutes";
import { loginSchema } from "../schema/auth.error";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.phoneNumber, data.password);

      if (!user) {
        const msg = t("login.error");
        setError("root", {
          message: msg,
        });
        toast.error(msg);
        return;
      }

      console.log("login error", user);

      // success
      toast.success(t("login.loginSuccess") || t("login.loginButton"), {});
      if (user.role === "admin") {
        console.log(user.role, "this is role in admin");
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError("root", {
        message: err.message || t("login.error"),
      });
      toast.error(err.message || t("login.error"), {});
    }
  };

  const onError = (errs: any) => {
    if (errs?.phoneNumber) {
      toast.error(errs.phoneNumber.message, {});
      return;
    }
    if (errs?.password) {
      toast.error(errs.password.message, {});
      return;
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };
  const handleForgetPassword = () => {
    const phone = getValues("phoneNumber");
    try {
      loginSchema.pick({ phoneNumber: true }).parse({ phoneNumber: phone });
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || t("login.phoneRequired"));
      return;
    }

    navigate("/reset-password", {
      state: { phoneNumber: phone },
    });
  };

  return (
    <GuestRoute>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
        }}
      >
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div className="max-w-md w-full">
          <div
            className="cursor-pointer flex justify-center items-center mb-5 "
            onClick={() => (window.location.href = "https://jobx.uz/")}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              JOB
              <span
                className="inline-block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-gray-500 animate-pulse via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x"
                style={{
                  transform: "rotateY(-25deg) skewY(-10deg)",
                  display: "inline-block",
                }}
              >
                X
              </span>
            </h1>
          </div>
          <div
            className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10"
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {t("login.title")}
              </h2>
              <p className="text-white">{t("login.subtitle")}</p>
            </div>

            {errors.root && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-white text-sm">{errors.root.message}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="label">{t("login.phoneNumber")}</label>
                <input
                  type="tel"
                  placeholder={t("register.phonePlaceholder") as string}
                  disabled={isSubmitting}
                  {...register("phoneNumber")}
                  className={`input ${errors.phoneNumber ? "border-destructive" : ""}`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-400 text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="label">{t("register.password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder") as string}
                    disabled={isSubmitting}
                    {...register("password")}
                    className={`input py-5 ${
                      errors.password ? "border-destructive" : ""
                    } pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submitBtn"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("login.loggingIn")}
                  </span>
                ) : (
                  t("login.loginButton")
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToRegister}
                className="text-white hover:text-gray-200 font-medium transition-colors hover:underline cursor-pointer"
                disabled={isSubmitting}
              >
                {t("login.register")}
              </button>
              <button
                type="button"
                onClick={handleForgetPassword}
                className="text-white hover:text-gray-200 font-medium transition-colors underline cursor-pointer"
                disabled={isSubmitting}
              >
                {t("login.forgotPassword", {
                  defaultValue: "Parolingizni unutdingizmi?",
                })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
};

export default LoginPage;
