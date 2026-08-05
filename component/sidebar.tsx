"use client";

import useSideBarStore from "@/store/sidebar";
import { ClassOnlyProps } from "@/type/component";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/util";
import { useEffect } from "react";
import useEditorStore from "@/store/editor";
import useKeyboard from "@/hook/useKeyboard";

export default function SideBar({ className }: ClassOnlyProps) {
   const { open, toggle } = useSideBarStore();
   const editorStore = useEditorStore();

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
                     "fixed left-0 bg-card text-card border-r border-foreground/10 shadow-lg shadow-black/20 rounded-r-2xl w-1/3 top-0 h-dvh",
                     className,
                  )}
               >
                  Hello
               </motion.nav>
            </>
         )}
      </AnimatePresence>
   );
}
