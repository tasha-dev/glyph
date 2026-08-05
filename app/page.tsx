"use client";

import Editor from "@/component/editor";
import SideBar from "@/component/sidebar";
import Toolbar from "@/component/toolbar";
import useEditorStore from "@/store/editor";
import useNotesStore from "@/store/notes";
import { useRef } from "react";
import { Button } from "@/component/ui/button";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/component/ui/empty";
import { Heading } from "lucide-react";
import { Kbd, KbdGroup } from "@/component/ui/kbd";
import useSideBarStore from "@/store/sidebar";
import { ScrollArea } from "@/component/ui/scroll-area";

export default function HomePage() {
   const editorRef = useRef<HTMLDivElement | null>(null);
   const { disabled, activeNoteId } = useEditorStore();
   const { notes, updateNote } = useNotesStore();
   const { toggle } = useSideBarStore();

   const activeNote = activeNoteId && notes.find((item) => item.id);

   return (
      <section className="relative z-0">
         <Toolbar className="fixed top-2 right-2 z-10" />
         <SideBar className="z-30" />
         <main onClick={() => editorRef.current?.focus()}>
            {activeNote && activeNoteId ? (
               <Editor
                  initialMarkdown={activeNote.content}
                  disabled={disabled}
                  ref={editorRef}
                  onChange={(content) => {
                     updateNote(activeNoteId, activeNote.title, content);
                  }}
               />
            ) : (
               <ScrollArea className={"h-dvh overflow-auto p-4"}>
                  <div className="min-h-dvh flex items-center justify-center  max-w-2xl mx-auto">
                     <Empty className="p-0 m-0 rounded-0">
                        <EmptyHeader>
                           <EmptyMedia variant="icon">
                              <Heading />
                           </EmptyMedia>
                           <EmptyTitle>Nothing to Show Yet</EmptyTitle>
                           <EmptyDescription>
                              Choose a Markdown file from the left sidebar to
                              begin editing <br /> or Start new file from there.{" "}
                              <br /> Your selected file will appear here.
                           </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                           <Button onClick={toggle}>
                              Open sidebar
                              <KbdGroup>
                                 <Kbd>s</Kbd>
                              </KbdGroup>
                           </Button>
                        </EmptyContent>
                     </Empty>
                  </div>
               </ScrollArea>
            )}
         </main>
      </section>
   );
}
