"use client";

import Editor from "@/component/editor";
import SideBar from "@/component/sidebar";
import Toolbar from "@/component/toolbar";
import useEditorStore from "@/store/editor";
import useNotesStore from "@/store/notes";
import { useRef } from "react";
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
import { cn } from "@/lib/util";
import MarkdownRenderer from "@/component/markdownRenderer";
import CommandMenu from "@/component/command";
import DesktopGuard from "@/component/guard/desktopGuard";

export default function HomePage() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { disabled, activeNoteId, mode } = useEditorStore();
  const { notes, updateNote } = useNotesStore();
  const { toggle, open } = useSideBarStore();

  const activeNote = notes.find((item) => item.id === activeNoteId);

  return (
    <DesktopGuard>
      <CommandMenu />
      {activeNote && (
        <section className="hidden print:block">
          <MarkdownRenderer>{activeNote.content}</MarkdownRenderer>
        </section>
      )}
      <section className="relative z-0 print:hidden">
        <SideBar className="z-30" />
        <div inert={open ? true : undefined}>
          <Toolbar className="fixed top-2 right-2 z-10 shadow-lg shadow-black/10" />
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
                      size: "default",
                      variant: "secondary",
                      className: "shadow-lg shadow-black/10",
                    })}
                  >
                    {activeNote.title}.md
                  </div>
                  {mode !== "disabled" && (
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
                  )}
                </div>
                {notes.map(
                  (item, index) =>
                    item.id === activeNoteId && (
                      <Editor
                        key={index}
                        initialMarkdown={item.content}
                        disabled={disabled}
                        ref={editorRef}
                        onChange={(content) => {
                          updateNote(item.id, item.title, content);
                        }}
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
                        Choose a Markdown file from the left sidebar to begin
                        editing <br /> or Start new file from there. <br /> Your
                        selected file will appear here.
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
    </DesktopGuard>
  );
}
