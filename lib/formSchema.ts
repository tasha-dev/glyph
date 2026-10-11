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

export type createNewNoteFormType = z.infer<typeof createNewNoteFormSchema>;
export type loginFormType = z.infer<typeof loginFormSchema>;
