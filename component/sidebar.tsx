"use client";

import useSideBarStore from "@/store/sidebar";
import { ClassOnlyProps } from "@/type/component";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/util";
import { useEffect } from "react";
import useEditorStore from "@/store/editor";
import useKeyboard from "@/hook/useKeyboard";
import useNotesStore from "@/store/notes";
import { ScrollArea } from "./ui/scroll-area";
import AddNote from "./popover/addNote";
import NoteItem from "./noteItem";

export default function SideBar({ className }: ClassOnlyProps) {
   const { open, toggle } = useSideBarStore();
   const editorStore = useEditorStore();
   const { notes } = useNotesStore();

   useEffect(() => {
      if (!open) editorStore.setDisabled(false);
      else editorStore.setDisabled(true);
   }, [open]);

   useKeyboard(
      "s",
      () => toggle(),
      false,
      editorStore.mode === "disabled" && open,
   );

   useKeyboard(
      "escape",
      () => toggle(),
      false,
      editorStore.mode === "disabled" && open,
   );

   return (
      <AnimatePresence key="sidebar">
         {open && (
            <>
               <motion.div
                  onClick={() => toggle()}
                  className="fixed inset-0 z-20 backdrop-blur-3xl bg-card/10"
                  initial={{
                     opacity: 0,
                  }}
                  animate={{
                     opacity: 1,
                  }}
                  exit={{
                     opacity: 0,
                  }}
                  transition={{
                     type: "spring",
                     stiffness: 320,
                     damping: 28,
                     mass: 0.8,
                     delay: 0.2,
                  }}
               />
               <motion.nav
                  initial={{
                     x: -40,
                     opacity: 0,
                     filter: "blur(4px)",
                  }}
                  animate={{
                     x: 0,
                     opacity: 1,
                     filter: "blur(0px)",
                  }}
                  exit={{
                     x: -40,
                     opacity: 0,
                     filter: "blur(4px)",
                  }}
                  transition={{
                     type: "spring",
                     stiffness: 320,
                     damping: 28,
                     mass: 0.8,
                  }}
                  className={cn(
                     "fixed left-0 bg-card border-r border-foreground/10 shadow-lg shadow-black/20 rounded-r-2xl top-0 h-dvh overflow-hidden text-foreground",
                     "lg:w-1/3 w-3/4",
                     className,
                  )}
               >
                  <ScrollArea className={"h-dvh"}>
                     <div className="flex items-center justify-between gap-2 p-4 border-b border-b-foreground/10">
                        <span className="font-semibold text-lg block truncate flex-1">
                           Your notes
                        </span>
                        <AddNote />
                     </div>
                     <div className="p-4 flex flex-col gap-3">
                        {notes.map((item, index) => (
                           <NoteItem key={index} data={item} />
                        ))}
                     </div>
                  </ScrollArea>
               </motion.nav>
            </>
         )}
      </AnimatePresence>
   );
}
