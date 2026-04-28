import { z } from "zod";

export const LoginInputSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const PasswordChangeInputSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
      .max(200)
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
      .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre."),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "La confirmation ne correspond pas au nouveau mot de passe.",
    path: ["newPasswordConfirm"],
  });

export type PasswordChangeInput = z.infer<typeof PasswordChangeInputSchema>;
