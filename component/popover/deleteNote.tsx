"use client";

import { EditNoteProps } from "@/type/component";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
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

export default function DeleteNote({
   className,
   data: { id, title },
}: EditNoteProps) {
   const { removeNote } = useNotesStore();
   const [open, setOpen] = useState(false);

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger
            render={
               <Button
                  size="icon"
                  className={className}
                  variant={"destructive"}
               >
                  <Trash />
               </Button>
            }
         />
         <PopoverContent sideOffset={10}>
            <PopoverHeader>
               <PopoverTitle>Delete "{title}"</PopoverTitle>
               <PopoverDescription>
                  Are you sure you want to delete this note? This action cannot
                  be undone and the note will be permanently removed.
               </PopoverDescription>
            </PopoverHeader>
            <Button
               variant={"destructive"}
               onClick={() => {
                  try {
                     removeNote(id);
                     toast.success("The note is deleted successfully.");
                  } catch {
                     toast.error("There was an error while deleting the note.");
                  } finally {
                     setOpen(false);
                  }
               }}
            >
               <Trash /> Yes, delete the note ?
            </Button>
         </PopoverContent>
      </Popover>
   );
}
