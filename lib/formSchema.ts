import { z } from "zod";

export const createNewNoteFormSchema = z.object({
  title: z
    .string({
      message: "Please fill this input",
    })
    .min(2)
    .max(256),
});

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const signupFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(128, "Name must not exceed 128 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const recoveryFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type signupFormType = z.infer<typeof signupFormSchema>;
export type createNewNoteFormType = z.infer<typeof createNewNoteFormSchema>;
export type loginFormType = z.infer<typeof loginFormSchema>;
export type recoveryFormType = z.infer<typeof recoveryFormSchema>;
