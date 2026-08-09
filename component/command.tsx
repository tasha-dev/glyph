"use client";

import { FileText, Heading, Notebook, PanelLeft, SunMoon } from "lucide-react";
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

export default function CommandMenu({ className }: ClassOnlyProps) {
   const [open, setOpen] = useState(false);
   const { mode, setMode, activeNoteId, setActiveNoteId } = useEditorStore();
   const { theme, setTheme } = useTheme();
   const { toggle } = useSideBarStore();
   const { notes } = useNotesStore();

   useKeyboard(
      ":",
      () => {
         setOpen(true);
         setMode("disabled");
      },
      false,
      mode === "normal" && !open,
   );

   const activeNote = notes.find((item) => item.id === activeNoteId);

   return (
      <CommandDialog
         open={open}
         className={className}
         onOpenChange={(open) => {
            setOpen(open);

            if (!open) {
               setMode("normal");
            } else {
               setMode("disabled");
            }
         }}
      >
         <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
               <CommandEmpty>No results found.</CommandEmpty>
               <CommandGroup heading="Commands">
                  <CommandItem
                     onSelect={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                     }
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
                           exportMarkdown(
                              `${activeNote.title}.md`,
                              activeNote.content,
                           );
                        }
                     }}
                  >
                     <Heading />
                     <span>Export to markdown</span>
                  </CommandItem>
               </CommandGroup>
               <CommandSeparator />
               <CommandGroup heading="Notes">
                  {notes.map((note) => (
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
