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
import { VimMode, SelectionWithModify } from "@/type/general";

export default function MarkdownEditor({
   initialMarkdown = "# Hello world",
   onChange,
   className,
}: EditorProps) {
   const [mode, setMode] = useState<VimMode>("normal");
   const modeRef = useRef<VimMode>("normal");
   const pendingKeyRef = useRef<string | null>(null);

   const setVimMode = (m: VimMode) => {
      modeRef.current = m;
      setMode(m);
   };

   function handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      if (modeRef.current === "insert") {
         if (event.key === "Escape") {
            event.preventDefault();
            setVimMode("normal");
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
            return true;
         }
      }

      switch (key) {
         case "i":
            event.preventDefault();
            setVimMode("insert");
            return true;

         case "a":
            event.preventDefault();
            sel?.modify("move", "right", "character");
            setVimMode("insert");
            return true;

         case "A":
            event.preventDefault();
            sel?.modify("move", "right", "lineboundary");
            setVimMode("insert");
            return true;

         case "I":
            event.preventDefault();
            sel?.modify("move", "left", "lineboundary");
            setVimMode("insert");
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
            return true;
         }

         case "h":
            event.preventDefault();
            sel?.modify("move", "left", "character");
            return true;

         case "l":
            event.preventDefault();
            sel?.modify("move", "right", "character");
            return true;

         case "j":
            event.preventDefault();
            sel?.modify("move", "down", "line");
            return true;

         case "k":
            event.preventDefault();
            sel?.modify("move", "up", "line");
            return true;

         case "w":
            event.preventDefault();
            sel?.modify("move", "right", "word");
            return true;

         case "b":
            event.preventDefault();
            sel?.modify("move", "left", "word");
            return true;

         case "0":
            event.preventDefault();
            sel?.modify("move", "left", "lineboundary");
            return true;

         case "$":
            event.preventDefault();
            sel?.modify("move", "right", "lineboundary");
            return true;

         case "x": {
            event.preventDefault();
            const { from } = state.selection;
            if (from < state.doc.content.size) {
               dispatch(state.tr.delete(from, from + 1));
            }
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
            class: "outline-none p-4 prose prose-neutral mx-auto w-full max-w-2xl dark:prose-invert",
         },
         handleKeyDown,
      },
      onUpdate: ({ editor }) => {
         onChange?.(editor.getMarkdown());
      },
   });

   if (editor) {
      return (
         <div className={cn("h-dvh", className)}>
            <ScrollArea className="h-[calc(100dvh-40px)]">
               <EditorContent editor={editor} />
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
