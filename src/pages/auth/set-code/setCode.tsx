import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Language from "../../../components/LanguageSelector";
import { toast } from "react-toastify";
import { apiService } from "../../../services/api";
import { authService } from "../../../services/auth.services";

const RESEND_TIME = 120;

const SetCode: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber: string | undefined = location.state?.phoneNumber;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIME);

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/register");
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ////////////////////////
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    if (code.length !== 6) {
      setError(t("verification.invalidCode", { defaultValue: "Invalid code" }));
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === "") {
      throw new Error("Phone number is required");
    }
    if (!code || code.length !== 6) {
      throw new Error("Code must be 6 digits");
    }

    console.log("phone", phoneNumber);
    console.log("code ", code);

    setLoading(true);
    setError(null);

    try {
      const res = await authService.verifyCode(phoneNumber, code);

      if (res.success) {
        navigate("/login");
      } else {
        setError(res.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // r//////////////////////////
  const handleResend = async () => {
    if (!phoneNumber || timer > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      const res = await apiService.resendVerification(phoneNumber);

      toast.success(
        t("verification.codeSent", {
          defaultValue: "Verification code sent again",
        }),
      );

      if (res.success) {
        setCode("");
        setTimer(RESEND_TIME);
      } else {
        setError(res.message || "Failed to resend code");
        toast.error(res.message || "Failed to resend code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
      toast.error(err.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <Language />
      </div>

      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          {t("verification.title", {
            defaultValue: "Verify phone number",
          })}
        </h1>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {error && (
            <div className="mb-4 p-3 text-center text-red-300 bg-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <p className="text-white text-center mb-4">
            {t("verification.sentTo", { defaultValue: "Code sent to" })}{" "}
            <b>{phoneNumber}</b>
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[i] || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const newCode = code.split("");
                    newCode[i] = value;
                    setCode(newCode.join(""));

                    if (value && i < 5) {
                      const next = document.getElementById(
                        `code-${i + 1}`,
                      ) as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      const newCode = code.split("");
                      newCode[i] = "";
                      setCode(newCode.join(""));

                      if (i > 0 && !code[i]) {
                        const prev = document.getElementById(
                          `code-${i - 1}`,
                        ) as HTMLInputElement;
                        prev?.focus();
                      }
                    }
                  }}
                  className="w-12 h-12 text-center text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              {timer > 0 ? (
                <span className="text-sm text-white/70">
                  {t("verification.resendIn", {
                    defaultValue: "Code expires in {{seconds}}s",
                    seconds: timer,
                  })}
                </span>
              ) : (
                <span className="text-sm text-red-400 font-medium">
                  {t("verification.expired", {
                    defaultValue: "Code expired",
                  })}
                </span>
              )}

              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                >
                  {resendLoading
                    ? t("verification.sending", { defaultValue: "Sending..." })
                    : t("verification.tryAgain", { defaultValue: "Try again" })}
                </button>
              )}
            </div>

            <button
              type={timer > 0 ? "submit" : "button"}
              onClick={timer === 0 ? handleResend : undefined}
              disabled={timer > 0 ? loading || code.length < 6 : resendLoading}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition
    ${
      timer > 0
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-red-500 hover:bg-red-600 text-white"
    }
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
            >
              {timer > 0
                ? loading
                  ? t("verification.verifying", {
                      defaultValue: "Verifying...",
                    })
                  : t("verification.verify", { defaultValue: "Verify" })
                : resendLoading
                  ? t("verification.sending", { defaultValue: "Sending..." })
                  : t("verification.tryAgain", {
                      defaultValue: "Code expired · Try again",
                    })}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetCode;
