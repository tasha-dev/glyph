import { z } from "zod";

export const createNewNoteFormSchema = z.object({
   title: z
      .string({
         message: "Please fill this input",
      })
      .min(2)
      .max(256),
});

export type createNewNoteFormType = z.infer<typeof createNewNoteFormSchema>;
