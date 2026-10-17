"use client";

import { NoteItemProps } from "@/type/component";
import { Button, buttonVariants } from "./ui/button";
import { Eye, Notebook } from "lucide-react";
import { cn, daysAgo } from "@/lib/util";
import EditNote from "./popover/editNote";
import DeleteNote from "./popover/deleteNote";
import useEditorStore from "@/store/editor";
import useSideBarStore from "@/store/sidebar";
import { useIsMobile } from "@/hook/useIsMobile";

export default function NoteItem({ className, data }: NoteItemProps) {
  const { setActiveNoteId, setMode, resetContent } = useEditorStore();
  const { toggle } = useSideBarStore();
  const isMobile = useIsMobile();

  function openNote() {
    setActiveNoteId(data.id);
    toggle();
    setMode("insert");
    resetContent();
  }

  return (
    <div
      className={cn(
        buttonVariants({
          variant: "secondary",
        }),
        "flex items-center h-auto py-1.5 justify-between cursor-pointer w-full max-w-full",
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
      {!isMobile ? (
        <div className="shrink-0 flex items-center justify-end gap-2">
          <EditNote data={data} />
          <Button
            variant="outline"
            data-vim-item
            size="icon"
            onClick={openNote}
          >
            <Eye />
          </Button>
          <DeleteNote data={data} />
        </div>
      ) : (
        <Button
          variant="outline"
          data-vim-item
          size="icon"
          onClick={openNote}
          className={"shrink-0"}
        >
          <Eye />
        </Button>
      )}
    </div>
  );
}
