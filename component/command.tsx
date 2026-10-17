"use client";

import {
  FileText,
  Heading,
  Loader2,
  Notebook,
  PanelLeft,
  Save,
  SunMoon,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/component/ui/command";
import { ClassOnlyProps } from "@/type/component";
import { useState } from "react";
import useKeyboard from "@/hook/useKeyboard";
import useEditorStore from "@/store/editor";
import { useTheme } from "next-themes";
import useSideBarStore from "@/store/sidebar";
import useNotesStore from "@/store/notes";
import { exportMarkdown, printWithDelay } from "@/lib/file";
import { useAuthFetch } from "@/context/authFetchContext";
import { useUserNotes } from "@/context/userNotesContext";
import { useMutation } from "@tanstack/react-query";
import { DATABASE_ID, TABLE_ID, tablesDB } from "@/lib/appwrite/client";
import { AppwriteException } from "appwrite";
import { toast } from "sonner";

export default function CommandMenu({ className }: ClassOnlyProps) {
  const [open, setOpen] = useState(false);
  const { mode, setMode, activeNoteId, setActiveNoteId, content } =
    useEditorStore();

  const { theme, setTheme } = useTheme();
  const { toggle } = useSideBarStore();
  const { notes, updateNote } = useNotesStore();

  const userFetch = useAuthFetch();
  const userNotes = useUserNotes();

  useKeyboard(
    ":",
    () => {
      setOpen(true);
      setMode("disabled");
    },
    false,
    mode === "normal" && !open,
  );

  const activeNote =
    userFetch.data && userNotes.data
      ? userNotes.data.find((item) => item.$id === activeNoteId)
      : notes.find((item) => item.id === activeNoteId);

  const saveMutation = useMutation({
    mutationFn: (content: string) => {
      if (!activeNoteId) throw new Error("THere is no active Note ID");

      return tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: activeNoteId,
        data: {
          content,
        },
      });
    },
  });

  async function handleSave() {
    if (activeNoteId && activeNote) {
      if (userFetch.data && userNotes.data) {
        try {
          await saveMutation.mutateAsync(content);

          setOpen(false);
          setMode("insert");
          toast.success("Your changes have been saved.");

          userNotes.refetch();
        } catch (err) {
          const error = err as AppwriteException;
          toast.error(error.message);
        }
      } else {
        updateNote(activeNoteId, activeNote.title, content);
        setOpen(false);
        toast.success("Your changes have been saved.");
        setMode("insert");
      }
    }
  }

  return (
    <CommandDialog
      open={open}
      className={className}
      onOpenChange={(open) => {
        if (!saveMutation.isPending) {
          setOpen(open);
          setMode(!open ? "normal" : "disabled");
        }
      }}
    >
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Commands">
            <CommandItem
              disabled={!activeNote || saveMutation.isPending}
              onSelect={handleSave}
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save />
              )}
              <span>Write / Save note</span>
            </CommandItem>
            <CommandItem
              onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunMoon />
              <span>Toggle Theme</span>
              <CommandShortcut>t</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toggle();
                setOpen(false);
              }}
            >
              <PanelLeft />
              <span>Toggle Sidebar</span>
              <CommandShortcut>s</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Export">
            <CommandItem
              disabled={activeNote === undefined}
              onSelect={() => {
                setOpen(false);
                printWithDelay();
              }}
            >
              <FileText />
              <span>Export to PDF</span>
            </CommandItem>
            <CommandItem
              disabled={activeNote === undefined}
              onSelect={() => {
                if (activeNote !== undefined) {
                  setOpen(false);
                  exportMarkdown(`${activeNote.title}.md`, activeNote.content);
                }
              }}
            >
              <Heading />
              <span>Export to markdown</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Notes">
            {userFetch.data && userNotes.data
              ? userNotes.data.map((note) => (
                  <CommandItem
                    key={note.$id}
                    onSelect={() => {
                      setOpen(false);
                      setActiveNoteId(note.$id);
                      setMode("insert");
                    }}
                  >
                    <Notebook />
                    <span>{note.title}</span>
                  </CommandItem>
                ))
              : notes.map((note) => (
                  <CommandItem
                    key={note.id}
                    onSelect={() => {
                      setOpen(false);
                      setActiveNoteId(note.id);
                      setMode("insert");
                    }}
                  >
                    <Notebook />
                    <span>{note.title}</span>
                  </CommandItem>
                ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
