"use client";

import { ClassOnlyProps } from "@/type/component";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
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
import { DATABASE_ID, TABLE_ID, tablesDB } from "@/lib/appwrite/client";
import { Permission, Role } from "appwrite";
import { useMutation } from "@tanstack/react-query";

export default function AddNote({ className }: ClassOnlyProps) {
  const { addNote, notes } = useNotesStore();
  const [open, setOpen] = useState(false);
  const form = useForm<createNewNoteFormType>({
    resolver: zodResolver(createNewNoteFormSchema),
  });

  const userFetch = useAuthFetch();
  const userNotes = useUserNotes();

  const mutation = useMutation({
    mutationFn: (title: string) => {
      if (!userFetch.data || !userNotes.data) {
        throw new Error("User data is not available");
      }

      const userId = userFetch.data.$id;

      return tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: crypto.randomUUID(),
        data: {
          title,
          content: "",
          userId,
        },
        permissions: [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
      });
    },
  });

  const onSubmit: SubmitHandler<createNewNoteFormType> = async (data) => {
    try {
      const isNotesAuthValid = userFetch.data && userNotes.data;
      const isDuplicated = isNotesAuthValid
        ? !!userNotes.data.find((item) => item.title === data.title)
        : !!notes.find((item) => item.title === data.title);

      if (!isDuplicated) {
        if (!isNotesAuthValid) addNote(data.title);
        else {
          await mutation.mutateAsync(data.title);
          userNotes.refetch();
        }

        toast.success("The note is added successfully.");
      } else {
        toast.error("The note already exists.Try another name for it.");
      }
    } catch {
      toast.error("There was an error while adding the note.");
    } finally {
      setOpen(false);

      form.reset({
        title: "",
      });
    }
  };

  return (
    <Popover open={mutation.isPending ? true : open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            className={className}
            data-vim-item
            autoFocus
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
            )}
          </Button>
        }
      />
      <PopoverContent sideOffset={10}>
        <PopoverHeader>
          <PopoverTitle>Create New Note</PopoverTitle>
          <PopoverDescription>
            Start a fresh note to capture ideas, tasks, or thoughts. Add a title
            and save it to your collection.
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
            data-vim-item
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
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
