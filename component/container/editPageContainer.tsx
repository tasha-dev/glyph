"use client";

import { useAuthFetch } from "@/context/authFetchContext";
import { useUserNotes } from "@/context/userNotesContext";
import Editor from "@/component/editor";
import SideBar from "@/component/sidebar";
import Toolbar from "@/component/toolbar";
import useEditorStore from "@/store/editor";
import useNotesStore from "@/store/notes";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/component/ui/button";
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
import { cn, hasFarsiOrArabicWords } from "@/lib/util";
import MarkdownRenderer from "@/component/markdownRenderer";
import CommandMenu from "@/component/command";
import { useIsMobile } from "@/hook/useIsMobile";

export default function EditPageContainer() {
   const editorRef = useRef<HTMLDivElement | null>(null);
   const { disabled, activeNoteId, mode, updateContent } = useEditorStore();
   const { notes } = useNotesStore();
   const { toggle, open } = useSideBarStore();

   const userFetch = useAuthFetch();
   const userNotes = useUserNotes();
   const isMobile = useIsMobile();

   const activeNote =
      userFetch.data && userNotes.data
         ? userNotes.data.find((item) => item.$id === activeNoteId)
         : notes.find((item) => item.id === activeNoteId);

   const dir = hasFarsiOrArabicWords(activeNote?.content ?? "") ? "rtl" : "ltr";

   if (isMobile && activeNote) {
      return (
         <>
            <section>
               <main className={"p-4 relative"}>
                  <SideBar className="z-30 print:hidden flex" />
                  <div className="fixed top-4 right-4 z-10 items-center justify-center gap-1 print:hidden flex">
                     <div
                        className={buttonVariants({
                           size: "lg",
                           variant: "secondary",
                           className: "shadow-lg shadow-black/10",
                        })}
                     >
                        {activeNote.title}.md
                     </div>
                     <Toolbar className="shadow-lg shadow-black/10" />
                  </div>
                  <div dir={dir}>
                     <MarkdownRenderer className="pt-15 print:pt-0">
                        {activeNote.content}
                     </MarkdownRenderer>
                  </div>
               </main>
            </section>
         </>
      );
   } else {
      return (
         <>
            <CommandMenu />
            {activeNote && (
               <section className="hidden print:block" dir={dir}>
                  <MarkdownRenderer>{activeNote.content}</MarkdownRenderer>
               </section>
            )}
            <section className="relative z-0 print:hidden">
               <SideBar className="z-30" />
               <div inert={open ? true : undefined}>
                  <Toolbar className="fixed top-4 right-4 z-10 shadow-lg shadow-black/10" />
                  <main
                     onClick={(e) => {
                        if (activeNote) {
                           e.preventDefault();
                        }
                     }}
                  >
                     {activeNote ? (
                        <>
                           <div className="flex items-center justif-between gap-2 z-10 fixed bottom-2 right-2 flex-wrap">
                              <div
                                 className={buttonVariants({
                                    size: "lg",
                                    variant: "secondary",
                                    className: "shadow-lg shadow-black/10",
                                 })}
                              >
                                 {activeNote.title}.md
                              </div>
                              {mode !== "disabled" ? (
                                 <div
                                    data-mode={mode}
                                    className={buttonVariants({
                                       variant: "secondary",
                                       size: "default",
                                       className: cn(
                                          "border-dashed !border-current transition-colors duration-300 shadow-lg shadow-black/10",
                                          "data-[mode=normal]:text-sky-500",
                                          "data-[mode=insert]:text-rose-500",
                                          "data-[mode=visual]:text-amber-500",
                                       ),
                                    })}
                                 >
                                    -- {mode.toUpperCase()} --
                                 </div>
                              ) : (
                                 false
                              )}
                           </div>
                           {userFetch.data && userNotes.data
                              ? userNotes.data.map(
                                   (item, index) =>
                                      item.$id === activeNoteId && (
                                         <Editor
                                            dir={dir}
                                            key={index}
                                            initialMarkdown={item.content}
                                            disabled={disabled}
                                            onChange={updateContent}
                                            ref={editorRef}
                                         />
                                      ),
                                )
                              : notes.map(
                                   (item, index) =>
                                      item.id === activeNoteId && (
                                         <Editor
                                            key={index}
                                            dir={dir}
                                            initialMarkdown={item.content}
                                            disabled={disabled}
                                            ref={editorRef}
                                            onChange={updateContent}
                                         />
                                      ),
                                )}
                        </>
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
                                       {isMobile
                                          ? "Choose a Markdown file from the sidebar to begin Viewing. Your selected file will appear here."
                                          : "Choose a Markdown file from the left sidebar to begin editing or Start new file from there. Your selected file will appear here."}
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
               </div>
            </section>
         </>
      );
   }
}
