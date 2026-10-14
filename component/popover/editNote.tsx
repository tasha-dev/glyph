"use client";

import { EditNoteProps } from "@/type/component";
import { Button } from "../ui/button";
import { Loader2, Pen } from "lucide-react";
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
import { useAuthFetch } from "@/context/authFetchContext";
import { useUserNotes } from "@/context/userNotesContext";
import { useMutation } from "@tanstack/react-query";
import { DATABASE_ID, TABLE_ID, tablesDB } from "@/lib/appwrite/client";
import { AppwriteException } from "appwrite";

export default function EditNote({
  className,
  data: { id, title, content },
}: EditNoteProps) {
  const { updateNote, notes } = useNotesStore();
  const [open, setOpen] = useState(false);
  const form = useForm<createNewNoteFormType>({
    resolver: zodResolver(createNewNoteFormSchema),
    defaultValues: {
      title,
    },
  });

  const userFetch = useAuthFetch();
  const userNotes = useUserNotes();
  const isNotesAuthValid = userFetch.data && userNotes.data;

  const mutation = useMutation({
    mutationFn: (newTitle: string) => {
      if (!isNotesAuthValid) {
        throw new Error("User data is not available");
      }

      return tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id,
        data: {
          title: newTitle,
        },
      });
    },
  });

  const onSubmit: SubmitHandler<createNewNoteFormType> = async (data) => {
    try {
      const isDuplicated = isNotesAuthValid
        ? !!userNotes.data.find((item) => item.title === data.title)
        : !!notes.find((item) => item.title === data.title);

      if (!isDuplicated) {
        if (!isNotesAuthValid) updateNote(id, data.title, content);
        else {
          await mutation.mutateAsync(data.title);
          userNotes.refetch();
        }

        toast.success("The note is edited successfully.");
      } else {
        toast.error("The note already exists.Try another name for it.");
      }
    } catch (err) {
      if (isNotesAuthValid) {
        const error = err as AppwriteException;
        toast.error(error.message);
      } else {
        toast.error("There was an error while editing the note.");
      }
    } finally {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size={"icon"}
            className={className}
            data-vim-item
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Pen />
            )}
          </Button>
        }
      />
      <PopoverContent sideOffset={10}>
        <PopoverHeader>
          <PopoverTitle>Edit Note</PopoverTitle>
          <PopoverDescription>
            Edit a note to capture new ideas, tasks, or thoughts. Add a title
            and edit the note in your collection.
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
              <Field data-invalid={fieldState.invalid} className="flex-1">
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
          <Button
            size="icon"
            className={"shrink-0"}
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Pen />
            )}
          </Button>
        </form>
        {form.formState.errors.title && (
          <FieldError errors={[form.formState.errors.title]} />
        )}
      </PopoverContent>
    </Popover>
  );
}
