"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { useRef, useState } from "react";
import { cn } from "@/lib/util";
import { EditorProps } from "@/type/component";
import { ScrollArea } from "@/component/ui/scroll-area";
import { VimMode, SelectionWithModify, BlockCursorRect } from "@/type/editor";

const INSERT_CURSOR_WIDTH = 2; // thin bar, like Vim insert mode

export default function MarkdownEditor({
   initialMarkdown = "# Hello world",
   onChange,
   className,
}: EditorProps) {
   const [mode, setMode] = useState<VimMode>("normal");
   const modeRef = useRef<VimMode>("normal");
   const pendingKeyRef = useRef<string | null>(null);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const [cursorRect, setCursorRect] = useState<BlockCursorRect | null>(null);

   const setVimMode = (m: VimMode) => {
      modeRef.current = m;
      setMode(m);
   };

   function updateCursor(view: EditorView) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const { from } = view.state.selection;

      let startCoords;
      try {
         startCoords = view.coordsAtPos(from);
      } catch {
         setCursorRect(null);
         return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const height = startCoords.bottom - startCoords.top;
      const top = startCoords.top - wrapperRect.top;
      const left = startCoords.left - wrapperRect.left;

      if (modeRef.current === "insert") {
         // thin bar cursor — fixed width, sits right at the caret position
         setCursorRect({ top, left, width: INSERT_CURSOR_WIDTH, height });
         return;
      }

      // normal mode — block cursor, width = width of char under cursor
      let width = 8;
      const docSize = view.state.doc.content.size;
      if (from < docSize) {
         try {
            const endCoords = view.coordsAtPos(from + 1);
            const measured = endCoords.left - startCoords.left;
            if (measured > 0 && measured < 40) width = measured;
         } catch {
            // keep fallback width
         }
      }
      setCursorRect({ top, left, width, height });
   }

   function handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      if (modeRef.current === "insert") {
         if (event.key === "Escape") {
            event.preventDefault();
            setVimMode("normal");
            updateCursor(view);
            return true;
         } else {
            return false;
         }
      }

      // Normal Mode
      const sel = (
         typeof window !== "undefined" ? window.getSelection() : null
      ) as SelectionWithModify | null;
      const { state, dispatch } = view;
      const key = event.key;

      // handle two-key "dd" (delete current block)
      if (pendingKeyRef.current === "d") {
         pendingKeyRef.current = null;
         if (key === "d") {
            event.preventDefault();
            const { $from } = state.selection;
            const start = $from.before($from.depth);
            const end = $from.after($from.depth);
            dispatch(state.tr.delete(start, end));
            updateCursor(view);
            return true;
         }
      }

      switch (key) {
         case "i":
            event.preventDefault();
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "a":
            event.preventDefault();
            sel?.modify("move", "right", "character");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "A":
            event.preventDefault();
            sel?.modify("move", "right", "lineboundary");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "I":
            event.preventDefault();
            sel?.modify("move", "left", "lineboundary");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "o": {
            event.preventDefault();
            const { $from } = state.selection;
            const pos = $from.after($from.depth);
            const paragraph = state.schema.nodes.paragraph.create();
            let tr = state.tr.insert(pos, paragraph);
            tr = tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
            dispatch(tr);
            setVimMode("insert");
            updateCursor(view);
            return true;
         }

         case "O": {
            event.preventDefault();
            const { $from } = state.selection;
            const pos = $from.before($from.depth);
            const paragraph = state.schema.nodes.paragraph.create();
            let tr = state.tr.insert(pos, paragraph);
            tr = tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
            dispatch(tr);
            setVimMode("insert");
            updateCursor(view);
            return true;
         }

         case "h":
            event.preventDefault();
            sel?.modify("move", "left", "character");
            updateCursor(view);
            return true;

         case "l":
            event.preventDefault();
            sel?.modify("move", "right", "character");
            updateCursor(view);
            return true;

         case "j":
            event.preventDefault();
            sel?.modify("move", "down", "line");
            updateCursor(view);
            return true;

         case "k":
            event.preventDefault();
            sel?.modify("move", "up", "line");
            updateCursor(view);
            return true;

         case "w":
            event.preventDefault();
            sel?.modify("move", "right", "word");
            updateCursor(view);
            return true;

         case "b":
            event.preventDefault();
            sel?.modify("move", "left", "word");
            updateCursor(view);
            return true;

         case "0":
            event.preventDefault();
            sel?.modify("move", "left", "lineboundary");
            updateCursor(view);
            return true;

         case "$":
            event.preventDefault();
            sel?.modify("move", "right", "lineboundary");
            updateCursor(view);
            return true;

         case "x": {
            event.preventDefault();
            const { from } = state.selection;
            if (from < state.doc.content.size) {
               dispatch(state.tr.delete(from, from + 1));
            }
            updateCursor(view);
            return true;
         }

         case "d":
            event.preventDefault();
            pendingKeyRef.current = "d";
            setTimeout(() => {
               if (pendingKeyRef.current === "d") pendingKeyRef.current = null;
            }, 600);
            return true;

         case "Escape":
            event.preventDefault();
            return true;

         default:
            event.preventDefault();
            return true;
      }
   }

   const editor = useEditor({
      extensions: [StarterKit, Markdown],
      content: initialMarkdown,
      contentType: "markdown",
      immediatelyRender: false,
      editorProps: {
         attributes: {
            spellcheck: "false",
            class: cn(
               "outline-none p-4 prose prose-neutral mx-auto w-full max-w-2xl dark:prose-invert caret-transparent relative",
            ),
         },
         handleKeyDown,
      },
      onCreate: ({ editor }) => {
         updateCursor(editor.view);
      },
      onUpdate: ({ editor }) => {
         onChange?.(editor.getMarkdown());
         updateCursor(editor.view);
      },
      onSelectionUpdate: ({ editor }) => {
         updateCursor(editor.view);
      },
   });

   if (editor) {
      return (
         <div className={cn("h-dvh", className)}>
            <ScrollArea className="h-[calc(100dvh-40px)]">
               <div ref={wrapperRef} className="relative">
                  <EditorContent editor={editor} />
                  {cursorRect && (
                     <div
                        className={cn(
                           "absolute pointer-events-none animate-pulse duration-100 bg-foreground",
                        )}
                        style={{
                           top: cursorRect.top,
                           left: cursorRect.left,
                           width: cursorRect.width,
                           height: cursorRect.height,
                           mixBlendMode:
                              mode === "insert" ? "normal" : "difference",
                        }}
                     />
                  )}
               </div>
            </ScrollArea>
            <div
               className={cn(
                  "flex items-center justify-between gap-4 px-4 text-xs font-mono text-white transition-colors h-10",
                  mode === "insert" ? "bg-fuchsia-500" : "bg-sky-500",
               )}
            >
               <span className="font-bold tracking-wide shrink-0">
                  {mode === "insert" ? "-- INSERT --" : "-- NORMAL --"}
               </span>
               <span className="opacity-90 hidden md:inline truncate">
                  i:insert · a/A:append · I:start · o/O:new-line · hjkl:move ·
                  w/b:word · 0/$:line · x:del-char · dd:del-line · Esc:normal
               </span>
            </div>
         </div>
      );
   }
}
