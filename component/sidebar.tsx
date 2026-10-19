"use client";

import useSideBarStore from "@/store/sidebar";
import { ClassOnlyProps } from "@/type/component";
import { useEffect, useRef } from "react";
import useEditorStore from "@/store/editor";
import useKeyboard from "@/hook/useKeyboard";
import useNotesStore from "@/store/notes";
import { ScrollArea } from "./ui/scroll-area";
import AddNote from "./popover/addNote";
import NoteItem from "./noteItem";
import useVimNavigation from "@/hook/useVimNavigation";
import { useAuthFetch } from "@/context/authFetchContext";
import { useUserNotes } from "@/context/userNotesContext";
import { useIsMobile } from "@/hook/useIsMobile";
import { Sheet, SheetContent } from "./ui/sheet";

export default function SideBar({ className }: ClassOnlyProps) {
   const { open, toggle } = useSideBarStore();
   const editorStore = useEditorStore();
   const { notes } = useNotesStore();
   const { data } = useAuthFetch();
   const dbNotes = useUserNotes();
   const isMobile = useIsMobile();

   const sideBarRef = useRef<HTMLDivElement>(null);

   useVimNavigation(sideBarRef, {
      disabled: !open,
      onSelect: (_, item) => item.click(),
   });

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
      <Sheet open={open} onOpenChange={toggle}>
         <SheetContent
            showCloseButton={false}
            side="left"
            className={className}
         >
            <ScrollArea className={"h-dvh w-full"} ref={sideBarRef}>
               <div className="flex items-center justify-between gap-2 p-4 border-b border-b-foreground/10 w-full">
                  <span className="font-semibold text-lg block truncate flex-1">
                     Your notes
                  </span>
                  {!isMobile && <AddNote />}
               </div>
               <div className="p-4 flex flex-col gap-3">
                  {data && dbNotes.data
                     ? dbNotes.data.map((item, index) => (
                          <NoteItem
                             key={index}
                             data={{
                                content: item.content,
                                createdAt: item.$createdAt,
                                id: item.$id,
                                title: item.title,
                             }}
                          />
                       ))
                     : notes.map((item, index) => (
                          <NoteItem key={index} data={item} />
                       ))}
               </div>
            </ScrollArea>
         </SheetContent>
      </Sheet>
   );
}
