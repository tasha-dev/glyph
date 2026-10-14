"use client";

import { EditNoteProps } from "@/type/component";
import { Button } from "../ui/button";
import { Loader2, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import useNotesStore from "@/store/notes";
import { toast } from "sonner";
import { useState } from "react";
import { useAuthFetch } from "@/context/authFetchContext";
import { useUserNotes } from "@/context/userNotesContext";
import { useMutation } from "@tanstack/react-query";
import { DATABASE_ID, TABLE_ID, tablesDB } from "@/lib/appwrite/client";
import { AppwriteException } from "appwrite";

export default function DeleteNote({
  className,
  data: { id, title },
}: EditNoteProps) {
  const { removeNote } = useNotesStore();
  const [open, setOpen] = useState(false);

  const userFetch = useAuthFetch();
  const userNotes = useUserNotes();
  const isNotesAuthValid = userFetch.data && userNotes.data;

  const mutation = useMutation({
    mutationFn: () => {
      if (!isNotesAuthValid) {
        throw new Error("User data is not available");
      }

      return tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id,
      });
    },
  });

  const onSubmit = async () => {
    try {
      if (isNotesAuthValid) {
        await mutation.mutateAsync();
        userNotes.refetch();
      } else {
        removeNote(id);
      }

      toast.success("The Note is deleted successfully.");
    } catch (err) {
      if (isNotesAuthValid) {
        const error = err as AppwriteException;
        toast.error(error.message);
      } else {
        toast.error("There was an error while deleting the note.");
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
            size="icon"
            className={className}
            variant={"destructive"}
            data-vim-item
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash />
            )}
          </Button>
        }
      />
      <PopoverContent sideOffset={10}>
        <PopoverHeader>
          <PopoverTitle>Delete "{title}"</PopoverTitle>
          <PopoverDescription>
            Are you sure you want to delete this note? This action cannot be
            undone and the note will be permanently removed.
          </PopoverDescription>
        </PopoverHeader>
        <Button
          variant={"destructive"}
          onClick={onSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Trash />
          )}{" "}
          Yes, delete the note ?
        </Button>
      </PopoverContent>
    </Popover>
  );
}
