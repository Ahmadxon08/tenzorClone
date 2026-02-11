"use client";

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import Language from "../../../components/LanguageSelector";
import { apiService } from "../../../services/api";
import { authService } from "../../../services/auth.services";

// Zod schema
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(32, "Password cannot exceed 32 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

const NewPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneNumber: string | undefined = location.state?.phoneNumber;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
  });

  if (!phoneNumber) {
    navigate("/login");
    return null;
  }

  const onSubmit = async (data: NewPasswordForm) => {
    try {
      const res = await authService.resetPasswordConfirm({
        phoneNumber,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (res?.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        toast.error(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <Language />
      </div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Set New Password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="label text-white">New Password</label>
            <input
              type="password"
              {...register("password")}
              className={`input ${errors.password ? "border-red-500" : ""}`}
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="label text-white">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`input ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Set Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium mt-2"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
