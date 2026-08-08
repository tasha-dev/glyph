"use client";

import {
   Code2,
   File,
   FileText,
   Heading,
   List,
   PanelLeft,
   SunMoon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { ClassOnlyProps } from "@/type/component";
import { useTheme } from "next-themes";
import { Kbd } from "./ui/kbd";
import useKeyboard from "@/hook/useKeyboard";
import useEditorStore from "@/store/editor";
import useSideBarStore from "@/store/sidebar";
import { useState } from "react";
import { exportMarkdown } from "@/lib/file";
import useNotesStore from "@/store/notes";

export default function Toolbar({ className }: ClassOnlyProps) {
   const [open, setOpen] = useState<boolean>(false);

   const { theme, setTheme } = useTheme();
   const { notes } = useNotesStore();
   const { mode, activeNoteId } = useEditorStore();
   const { toggle } = useSideBarStore();

   const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
   const activeNote = activeNoteId && notes.find((item) => item.id);

   useKeyboard("t", toggleTheme, false, mode === "normal");
   useKeyboard("s", () => toggle(), false, mode === "normal");
   useKeyboard("/", () => setOpen(!open), false, mode === "normal");

   return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
         <DropdownMenuTrigger
            render={
               <Button
                  size="icon-lg"
                  variant={"secondary"}
                  className={className}
               >
                  <List />
               </Button>
            }
         />
         <DropdownMenuContent className={"w-auto"} sideOffset={10}>
            <DropdownMenuItem className="cursor-pointer" onClick={toggle}>
               <PanelLeft />
               Toggle side bar
               <DropdownMenuShortcut className="ml-auto">
                  <Kbd>s</Kbd>
               </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
               <SunMoon />
               Change Theme
               <DropdownMenuShortcut className="ml-auto">
                  <Kbd>t</Kbd>
               </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               className="cursor-pointer"
               disabled={!activeNote || !activeNoteId}
               onClick={() => {
                  if (!!activeNoteId && !!activeNote) {
                     window.print();
                  }
               }}
            >
               <FileText />
               Export To PDF
            </DropdownMenuItem>
            <DropdownMenuItem
               className="cursor-pointer"
               disabled={!activeNote || !activeNoteId}
               onClick={() => {
                  if (!!activeNoteId && !!activeNote) {
                     exportMarkdown(activeNote.title, activeNote.content);
                  }
               }}
            >
               <Heading />
               Export To .md
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               render={
                  <Link
                     href="https://tasha.vercel.app"
                     className="cursor-pointer"
                     target="_blank"
                  >
                     <Code2 />
                     Mahdi Tasha
                  </Link>
               }
            />
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
