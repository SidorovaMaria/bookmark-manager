import { z } from "zod";
/**
 * Server-side validation for the signup form.
 * - name: required, trimmed, small upper bound to avoid abuse.
 * - email: required, trimmed, must be valid; we also lowercase here so DB uniqueness works.
 * - password: required, min length; DO NOT trim (passwords are exact bytes).
 */
export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(1, "Email is required")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/\d/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});
export type SignupInput = z.input<typeof signupSchema>;
export type SignupOutput = z.output<typeof signupSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(1, "Email is required")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.input<typeof signInSchema>;
export type SignInOutput = z.output<typeof signInSchema>;

export const sessionSchema = z.object({
  id: z.string(),
});
export type SessionType = z.infer<typeof sessionSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(1, "Email is required")
    .transform((v) => v.toLowerCase()),
});
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordOutput = z.output<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/\d/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordOutput = z.output<typeof resetPasswordSchema>;
