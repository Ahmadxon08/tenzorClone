"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Language from "../../../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { apiService } from "../../../services/api";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const api = apiService;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [resendSecondsLeft, setResendSecondsLeft] = useState(60);

  const getErrorMessage = (err: any): string => {
    if (!err) return "Unknown error";

    if (err.response?.data?.detail) return err.response.data.detail;

    if (typeof err.message === "string") {
      const match = err.message.match(/"detail":"([^"]+)"/);
      if (match) return match[1];
      return err.message;
    }

    return String(err);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendSecondsLeft > 0) {
      interval = setInterval(
        () => setResendSecondsLeft((prev) => prev - 1),
        1000,
      );
    }
    return () => clearInterval(interval);
  }, [step, resendSecondsLeft]);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.resetPasswordRequest(email);
      setIsError(false);
      setMessage(t("resetPassword.message"));
      setStep(2);
      setResendSecondsLeft(60);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);

    if (verificationCode.length !== 6) {
      setIsError(true);
      setMessage(
        t("resetPassword.enterFullCode", {
          defaultValue: "Enter the full code",
        }),
      );
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.resetPasswordVerify({
        email,
        code: verificationCode,
      });

      setStep(3);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSecondsLeft > 0) return;
    setLoading(true);

    try {
      await api.resetPasswordRequest(email);
      setIsError(false);
      setMessage(t("resetPassword.message"));
      setVerificationCode("");
      setResendSecondsLeft(60);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.resetPasswordConfirm({
        email,
        code: verificationCode,
        password,
        confirm_password: confirmPassword,
      });

      setIsError(false);
      navigate("/login");
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-5">
          {t("resetPassword.title")}
        </h1>

        <div
          className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10"
          style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
        >
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-center border backdrop-blur-sm ${
                isError
                  ? "bg-red-500/20 border-red-500/30 text-red-300"
                  : "bg-blue-500/20 border-blue-500/30 text-blue-300"
              }`}
            >
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("resetPassword.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  placeholder={t("resetPassword.emailPlaceholder") as string}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Yuborilmoqda..." : t("resetPassword.sendCode")}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirmCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("resetPassword.enterCode")}
                </label>

                <div className="flex justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      id={`code-${i}`}
                      autoFocus={i === 0}
                      value={verificationCode[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/, "");
                        if (!val) return;
                        const newCode = verificationCode.split("");
                        newCode[i] = val;
                        setVerificationCode(newCode.join(""));
                        if (i < 5) {
                          const next = document.getElementById(`code-${i + 1}`);
                          if (next) (next as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          const newCode = verificationCode.split("");
                          newCode[i] = "";
                          setVerificationCode(newCode.join(""));
                          if (i > 0) {
                            const prev = document.getElementById(
                              `code-${i - 1}`,
                            );
                            if (prev) (prev as HTMLInputElement).focus();
                          }
                        }
                      }}
                      className="w-12 h-12 text-center text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>

                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setVerificationCode("");
                      setMessage(null);
                    }}
                    className="text-white text-sm underline"
                  >
                    {t("resetPassword.back")}
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendSecondsLeft > 0}
                    className="text-white text-sm underline"
                  >
                    {resendSecondsLeft > 0
                      ? `${t("resetPassword.resendCode")} ${Math.floor(
                          resendSecondsLeft / 60,
                        )}:${(resendSecondsLeft % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : t("resetPassword.resendCode")}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verificationCode.length < 6 || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading
                  ? t("resetPassword.sendCode")
                  : t("resetPassword.sending")}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("resetPassword.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-white/10 rounded-lg text-white"
                    placeholder={t("resetPassword.passwordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 inset-y-0 flex items-center text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("resetPassword.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-white/10 rounded-lg text-white"
                    placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 inset-y-0 flex items-center text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Yangilanmoqda..." : "Parolni yangilash"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-white underline font-medium"
              disabled={loading}
            >
              {t("register.goToLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
