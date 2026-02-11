import { z } from "zod";
import { t } from "i18next";

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty(t("login.phoneRequired"))
    .regex(/^\+?\d{9,15}$/, t("login.phoneInvalid")),

  password: z
    .string()
    .nonempty(t("login.passwordRequired"))
    .min(6, t("login.passwordMin")),
});
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .nonempty(t("register.fullNameRequired"))
      .min(3, t("register.fullNameMin")),
    phoneNumber: z
      .string()
      .nonempty(t("register.phoneRequired"))
      .regex(/^\+?\d{9,15}$/, t("register.phoneInvalid")),
    password: z
      .string()
      .nonempty(t("register.passwordRequired"))
      .min(6, t("register.passwordMin")),
    confirmPassword: z.string().nonempty(t("register.confirmPasswordRequired")),
    companyName: z
      .string()
      .nonempty(t("register.companyNameRequired"))
      .min(2, t("register.companyNameMin")),
    description: z
      .string()
      .nonempty(t("register.descriptionRequired"))
      .min(10, t("register.descriptionMin")),
    tokenDuration: z.string().nonempty(t("register.tokenDurationRequired")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("register.passwordsDontMatch"),
    path: ["confirmPassword"],
  });
