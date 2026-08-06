"use client";

import { EditNoteProps } from "@/type/component";
import { Button } from "../ui/button";
import { Pen } from "lucide-react";
import {
   Popover,
   PopoverContent,
   PopoverDescription,
   PopoverHeader,
   PopoverTitle,
   PopoverTrigger,
} from "../ui/popover";
import { Input } from "../ui/input";
import {
   createNewNoteFormType,
   createNewNoteFormSchema,
} from "@/lib/formSchema";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError } from "../ui/field";
import useNotesStore from "@/store/notes";
import { toast } from "sonner";
import { useState } from "react";

export default function EditNote({
   className,
   data: { id, title, content },
}: EditNoteProps) {
   const { updateNote } = useNotesStore();
   const [open, setOpen] = useState(false);
   const form = useForm<createNewNoteFormType>({
      resolver: zodResolver(createNewNoteFormSchema),
      defaultValues: {
         title,
      },
   });

   const onSubmit: SubmitHandler<createNewNoteFormType> = (data) => {
      try {
         updateNote(id, data.title, content);
         toast.success("The note is edited successfully.");
      } catch {
         toast.error("There was an error while editing the note.");
      } finally {
         setOpen(false);
      }
   };

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger
            render={
               <Button size={"icon"}>
                  <Pen />
               </Button>
            }
         />
         <PopoverContent sideOffset={10}>
            <PopoverHeader>
               <PopoverTitle>Edit Note</PopoverTitle>
               <PopoverDescription>
                  Edit a note to capture new ideas, tasks, or thoughts. Add a
                  title and edit the note in your collection.
               </PopoverDescription>
            </PopoverHeader>
            <form
               action="#"
               className="flex items-center justify-between gap-2"
               onSubmit={form.handleSubmit(onSubmit)}
            >
               <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field
                        data-invalid={fieldState.invalid}
                        className="flex-1"
                     >
                        <Input
                           {...field}
                           aria-invalid={fieldState.invalid}
                           placeholder="Title"
                           autoComplete="off"
                           className="w-full"
                        />
                     </Field>
                  )}
               />
               <Button size="icon" className={"shrink-0"} type="submit">
                  <Pen />
               </Button>
            </form>
            {form.formState.errors.title && (
               <FieldError errors={[form.formState.errors.title]} />
            )}
         </PopoverContent>
      </Popover>
   );
}
