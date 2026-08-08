"use client";

import { ClassOnlyProps } from "@/type/component";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
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

export default function AddNote({ className }: ClassOnlyProps) {
   const { addNote, notes } = useNotesStore();
   const [open, setOpen] = useState(false);
   const form = useForm<createNewNoteFormType>({
      resolver: zodResolver(createNewNoteFormSchema),
   });

   const onSubmit: SubmitHandler<createNewNoteFormType> = (data) => {
      try {
         const foundedItem = notes.find((item) => item.title === data.title);

         if (!foundedItem) {
            addNote(data.title);
            toast.success("The note is added successfully.");
         } else {
            toast.error("The note already exists.Try another name for it.");
         }
      } catch {
         toast.error("There was an error while adding the note.");
      } finally {
         setOpen(false);
      }
   };

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger
            render={
               <Button size="icon" className={className}>
                  <Plus />
               </Button>
            }
         />
         <PopoverContent sideOffset={10}>
            <PopoverHeader>
               <PopoverTitle>Create New Note</PopoverTitle>
               <PopoverDescription>
                  Start a fresh note to capture ideas, tasks, or thoughts. Add a
                  title and save it to your collection.
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
                  <Plus />
               </Button>
            </form>
            {form.formState.errors.title && (
               <FieldError errors={[form.formState.errors.title]} />
            )}
         </PopoverContent>
      </Popover>
   );
}
