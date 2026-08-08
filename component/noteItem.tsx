"use client";

import { NoteItemProps } from "@/type/component";
import { Button, buttonVariants } from "./ui/button";
import { Eye, Notebook } from "lucide-react";
import { cn, daysAgo } from "@/lib/util";
import EditNote from "./popover/editNote";
import DeleteNote from "./popover/deleteNote";
import useEditorStore from "@/store/editor";
import useSideBarStore from "@/store/sidebar";

export default function NoteItem({ className, data }: NoteItemProps) {
   const { setActiveNoteId, setMode } = useEditorStore();
   const { toggle } = useSideBarStore();

   return (
      <div
         className={cn(
            buttonVariants({
               variant: "secondary",
            }),
            "flex items-center h-auto py-1.5 justify-between cursor-pointer",
            className,
         )}
      >
         <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
            <div
               className={
                  "size-9 flex items-center justify-center bg-card text-card-foreground rounded-md"
               }
            >
               <Notebook className="shrink-0 size-4.5" />
            </div>
            <div className="flex-1 overflow-hidden">
               <span className="block text-sm truncate w-full text-left">
                  {data.title}
               </span>
               <span className="text-muted-foreground text-xs w-full truncate text-left block">
                  {daysAgo(data.createdAt)}
               </span>
            </div>
         </div>
         <div className="shrink-0 flex items-center justify-end gap-2">
            <EditNote data={data} />
            <Button
               variant="outline"
               size="icon"
               onClick={() => {
                  setActiveNoteId(data.id);
                  toggle();
                  setMode("insert");
               }}
            >
               <Eye />
            </Button>
            <DeleteNote data={data} />
         </div>
      </div>
   );
}
