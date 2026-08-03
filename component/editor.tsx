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

// Moves the head vertically by one visual line while trying to preserve
// the horizontal "goal column" — this is the standard technique for
// reliable up/down movement in a ProseMirror/contenteditable editor,
// since Selection.modify("move","down","line") is unreliable across
// separate block elements.
function moveVertical(
   view: EditorView,
   dir: 1 | -1,
   goalX: number | null,
): { pos: number; x: number } | null {
   const { head } = view.state.selection;
   let coords;
   try {
      coords = view.coordsAtPos(head);
   } catch {
      return null;
   }
   const x = goalX ?? coords.left;
   const lineHeight = coords.bottom - coords.top || 16;
   const targetY =
      dir === 1 ? coords.bottom + lineHeight / 2 : coords.top - lineHeight / 2;
   const result = view.posAtCoords({ left: x, top: targetY });
   if (!result) return null;
   return { pos: result.pos, x };
}

export default function MarkdownEditor({
   initialMarkdown = "# Hello world",
   onChange,
   className,
}: EditorProps) {
   const [mode, setMode] = useState<VimMode>("normal");
   const modeRef = useRef<VimMode>("normal");
   const pendingKeyRef = useRef<string | null>(null);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const anchorPosRef = useRef<number | null>(null); // visual-mode selection anchor
   const goalColumnRef = useRef<number | null>(null); // preferred x for j/k

   const [cursorRect, setCursorRect] = useState<BlockCursorRect | null>(null);
   const [selectionRects, setSelectionRects] = useState<BlockCursorRect[]>([]);

   const setVimMode = (m: VimMode) => {
      modeRef.current = m;
      setMode(m);
   };

   // ---- Custom cursor + selection-highlight calculation ----
   function updateCursor(view: EditorView) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const { from, to, head } = view.state.selection;

      // --- selection highlight (visual mode only, non-empty range) ---
      if (modeRef.current === "visual" && from !== to) {
         try {
            const start = view.domAtPos(Math.min(from, to));
            const end = view.domAtPos(Math.max(from, to));
            const range = document.createRange();
            range.setStart(start.node, start.offset);
            range.setEnd(end.node, end.offset);
            const rects = Array.from(range.getClientRects()).map((r) => ({
               top: r.top - wrapperRect.top,
               left: r.left - wrapperRect.left,
               width: r.width,
               height: r.height,
            }));
            setSelectionRects(rects);
         } catch {
            setSelectionRects([]);
         }
      } else {
         setSelectionRects([]);
      }

      // --- caret / block cursor, always tracks the selection HEAD ---
      let startCoords;
      try {
         startCoords = view.coordsAtPos(head);
      } catch {
         setCursorRect(null);
         return;
      }
      const height = startCoords.bottom - startCoords.top;
      const top = startCoords.top - wrapperRect.top;
      const left = startCoords.left - wrapperRect.left;

      if (modeRef.current === "insert") {
         setCursorRect({ top, left, width: INSERT_CURSOR_WIDTH, height });
         return;
      }

      let width = 8;
      const docSize = view.state.doc.content.size;
      if (head < docSize) {
         try {
            const endCoords = view.coordsAtPos(head + 1);
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

      // ---------- INSERT MODE ----------
      if (modeRef.current === "insert") {
         if (event.key === "Escape") {
            event.preventDefault();
            setVimMode("normal");
            updateCursor(view);
            return true;
         }
         return false;
      }

      const { state, dispatch } = view;
      const key = event.key;
      const sel = (
         typeof window !== "undefined" ? window.getSelection() : null
      ) as SelectionWithModify | null;

      // ---------- VISUAL MODE ----------
      if (modeRef.current === "visual") {
         switch (key) {
            case "Escape":
            case "v": {
               event.preventDefault();
               const headPos = state.selection.head;
               anchorPosRef.current = null;
               goalColumnRef.current = null;
               setVimMode("normal");
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(state.doc, headPos),
                  ),
               );
               updateCursor(view);
               return true;
            }

            case "h":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "left", "character");
               updateCursor(view);
               return true;

            case "l":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "right", "character");
               updateCursor(view);
               return true;

            case "w":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "right", "word");
               updateCursor(view);
               return true;

            case "b":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "left", "word");
               updateCursor(view);
               return true;

            case "0":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "left", "lineboundary");
               updateCursor(view);
               return true;

            case "$":
               event.preventDefault();
               goalColumnRef.current = null;
               sel?.modify("extend", "right", "lineboundary");
               updateCursor(view);
               return true;

            case "j":
            case "k": {
               event.preventDefault();
               const moved = moveVertical(
                  view,
                  key === "j" ? 1 : -1,
                  goalColumnRef.current,
               );
               if (moved && anchorPosRef.current !== null) {
                  goalColumnRef.current = moved.x;
                  const newSel = TextSelection.create(
                     state.doc,
                     anchorPosRef.current,
                     moved.pos,
                  );
                  dispatch(state.tr.setSelection(newSel));
                  updateCursor(view);
               }
               return true;
            }

            case "x":
            case "d": {
               event.preventDefault();
               const { from, to } = state.selection;
               if (from !== to) {
                  dispatch(state.tr.delete(from, to));
               }
               anchorPosRef.current = null;
               goalColumnRef.current = null;
               setVimMode("normal");
               updateCursor(view);
               return true;
            }

            default:
               event.preventDefault();
               return true;
         }
      }

      // ---------- NORMAL MODE ----------
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
         case "v":
            event.preventDefault();
            anchorPosRef.current = state.selection.from;
            goalColumnRef.current = null;
            setVimMode("visual");
            updateCursor(view);
            return true;

         case "i":
            event.preventDefault();
            goalColumnRef.current = null;
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "a":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "right", "character");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "A":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "right", "lineboundary");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "I":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "left", "lineboundary");
            setVimMode("insert");
            updateCursor(view);
            return true;

         case "o": {
            event.preventDefault();
            goalColumnRef.current = null;
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
            goalColumnRef.current = null;
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
            goalColumnRef.current = null;
            sel?.modify("move", "left", "character");
            updateCursor(view);
            return true;

         case "l":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "right", "character");
            updateCursor(view);
            return true;

         case "j": {
            event.preventDefault();
            const moved = moveVertical(view, 1, goalColumnRef.current);
            if (moved) {
               goalColumnRef.current = moved.x;
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(state.doc, moved.pos),
                  ),
               );
               updateCursor(view);
            }
            return true;
         }

         case "k": {
            event.preventDefault();
            const moved = moveVertical(view, -1, goalColumnRef.current);
            if (moved) {
               goalColumnRef.current = moved.x;
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(state.doc, moved.pos),
                  ),
               );
               updateCursor(view);
            }
            return true;
         }

         case "w":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "right", "word");
            updateCursor(view);
            return true;

         case "b":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "left", "word");
            updateCursor(view);
            return true;

         case "0":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "left", "lineboundary");
            updateCursor(view);
            return true;

         case "$":
            event.preventDefault();
            goalColumnRef.current = null;
            sel?.modify("move", "right", "lineboundary");
            updateCursor(view);
            return true;

         case "x": {
            event.preventDefault();
            goalColumnRef.current = null;
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
      autofocus: true,
      editorProps: {
         attributes: {
            spellcheck: "false",
            class: cn(
               "outline-none p-4 prose prose-neutral mx-auto w-full max-w-2xl dark:prose-invert caret-transparent relative selection:bg-foreground selection:text-background",
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
                        className="absolute pointer-events-none animate-pulse duration-100 bg-foreground"
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
                  mode === "insert" && "bg-fuchsia-500",
                  mode === "normal" && "bg-sky-500",
                  mode === "visual" && "bg-amber-500",
               )}
            >
               <span className="font-bold tracking-wide shrink-0">
                  {mode === "insert" && "-- INSERT --"}
                  {mode === "normal" && "-- NORMAL --"}
                  {mode === "visual" && "-- VISUAL --"}
               </span>
               <span className="opacity-90 hidden md:inline truncate">
                  {mode === "visual"
                     ? "hjkl:move · w/b:word · 0/$:line · d/x:delete-selection · v/Esc:normal"
                     : "i:insert · a/A:append · I:start · o/O:new-line · v:visual · hjkl:move · w/b:word · 0/$:line · x:del-char · dd:del-line · Esc:normal"}
               </span>
            </div>
         </div>
      );
   }
}
