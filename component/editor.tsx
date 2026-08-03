"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TextSelection } from "@tiptap/pm/state";
import { undo, redo } from "@tiptap/pm/history";
import type { EditorView } from "@tiptap/pm/view";
import { useRef, useState } from "react";
import { cn } from "@/lib/util";
import { EditorProps } from "@/type/component";
import { ScrollArea } from "@/component/ui/scroll-area";
import { VimMode, SelectionWithModify, BlockCursorRect } from "@/type/editor";
import {
   applyOperator,
   clearPendingSoon,
   moveVertical,
   resolveMotion,
} from "@/lib/editor";

const INSERT_CURSOR_WIDTH = 2;

export default function MarkdownEditor({
   initialMarkdown = "# Hello world",
   onChange,
   className,
}: EditorProps) {
   const [mode, setMode] = useState<VimMode>("normal");
   const modeRef = useRef<VimMode>("normal");
   const wrapperRef = useRef<HTMLDivElement>(null);

   const anchorPosRef = useRef<number | null>(null); // visual-mode anchor
   const goalColumnRef = useRef<number | null>(null); // j/k goal column
   const registerRef = useRef<string>(""); // yank/delete register
   const pendingOperatorRef = useRef<"d" | "c" | "y" | null>(null);
   const pendingGRef = useRef(false); // waiting for second "g" in "gg"
   const pendingReplaceRef = useRef(false); // waiting for char after "r"

   const [cursorRect, setCursorRect] = useState<BlockCursorRect | null>(null);
   const [selectionRects, setSelectionRects] = useState<BlockCursorRect[]>([]);

   const setVimMode = (m: VimMode) => {
      modeRef.current = m;
      setMode(m);
   };

   function updateCursor(view: EditorView) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const { from, to, head } = view.state.selection;

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
      const key = event.key;

      // Ctrl+R = redo, works outside insert mode
      if (
         event.ctrlKey &&
         key.toLowerCase() === "r" &&
         modeRef.current !== "insert"
      ) {
         event.preventDefault();
         redo(view.state, view.dispatch);
         updateCursor(view);
         return true;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return false;

      // ---------- INSERT MODE ----------
      if (modeRef.current === "insert") {
         if (key === "Escape") {
            event.preventDefault();
            setVimMode("normal");
            updateCursor(view);
            return true;
         }
         return false;
      }

      const { state, dispatch } = view;
      const sel = (
         typeof window !== "undefined" ? window.getSelection() : null
      ) as SelectionWithModify | null;

      // ---------- Escape cancels any pending state / exits visual ----------
      if (key === "Escape") {
         event.preventDefault();
         pendingOperatorRef.current = null;
         pendingGRef.current = false;
         pendingReplaceRef.current = false;
         if (modeRef.current === "visual") {
            const headPos = state.selection.head;
            anchorPosRef.current = null;
            goalColumnRef.current = null;
            setVimMode("normal");
            dispatch(
               state.tr.setSelection(TextSelection.create(state.doc, headPos)),
            );
         }
         updateCursor(view);
         return true;
      }

      // ---------- pending "r<char>" replace ----------
      if (pendingReplaceRef.current) {
         pendingReplaceRef.current = false;
         event.preventDefault();
         if (key.length === 1) {
            const { from } = state.selection;
            if (from < state.doc.content.size) {
               let tr = state.tr.delete(from, from + 1);
               tr = tr.insertText(key, from);
               dispatch(tr);
            }
         }
         updateCursor(view);
         return true;
      }

      // ---------- pending "gg" ----------
      if (pendingGRef.current) {
         pendingGRef.current = false;
         if (key === "g") {
            event.preventDefault();
            const target = 0;
            if (modeRef.current === "visual" && anchorPosRef.current !== null) {
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(
                        state.doc,
                        anchorPosRef.current,
                        target,
                     ),
                  ),
               );
            } else if (pendingOperatorRef.current) {
               applyOperator(
                  view,
                  pendingOperatorRef.current,
                  state.selection.from,
                  target,
                  registerRef,
               );
               if (pendingOperatorRef.current === "c") setVimMode("insert");
               pendingOperatorRef.current = null;
            } else {
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(state.doc, target),
                  ),
               );
            }
            updateCursor(view);
            return true;
         }
         // not "gg" — drop it silently
      }

      // ---------- pending operator ("d"/"c"/"y" awaiting a motion) ----------
      if (pendingOperatorRef.current) {
         const op = pendingOperatorRef.current;
         event.preventDefault();

         if (key === op) {
            // linewise: dd / cc / yy — whole current block's text
            const { $from } = state.selection;
            applyOperator(view, op, $from.start(), $from.end(), registerRef);
            pendingOperatorRef.current = null;
            if (op === "c") setVimMode("insert");
            updateCursor(view);
            return true;
         }
         if (key === "g") {
            pendingGRef.current = true; // stay pending, wait for 2nd g
            clearPendingSoon(pendingGRef, false);
            return true;
         }
         if (key === "j" || key === "k") {
            const moved = moveVertical(
               view,
               key === "j" ? 1 : -1,
               goalColumnRef.current,
            );
            if (moved)
               applyOperator(
                  view,
                  op,
                  state.selection.from,
                  moved.pos,
                  registerRef,
               );
            pendingOperatorRef.current = null;
            if (op === "c") setVimMode("insert");
            updateCursor(view);
            return true;
         }

         const target = resolveMotion(view, key, state.selection.from);
         pendingOperatorRef.current = null;
         if (target !== null) {
            applyOperator(view, op, state.selection.from, target, registerRef);
            if (op === "c") setVimMode("insert");
         }
         updateCursor(view);
         return true;
      }

      // ---------- VISUAL MODE ----------
      if (modeRef.current === "visual") {
         switch (key) {
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
            case "l":
            case "w":
            case "b":
            case "e":
            case "0":
            case "^":
            case "$":
            case "G": {
               event.preventDefault();
               goalColumnRef.current = null;
               const target = resolveMotion(view, key, state.selection.head);
               if (target !== null && anchorPosRef.current !== null) {
                  dispatch(
                     state.tr.setSelection(
                        TextSelection.create(
                           state.doc,
                           anchorPosRef.current,
                           target,
                        ),
                     ),
                  );
                  updateCursor(view);
               }
               return true;
            }
            case "g":
               event.preventDefault();
               pendingGRef.current = true;
               clearPendingSoon(pendingGRef, false);
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
                  dispatch(
                     state.tr.setSelection(
                        TextSelection.create(
                           state.doc,
                           anchorPosRef.current,
                           moved.pos,
                        ),
                     ),
                  );
                  updateCursor(view);
               }
               return true;
            }
            case "d":
            case "x":
            case "c": {
               event.preventDefault();
               const { from, to } = state.selection;
               applyOperator(
                  view,
                  key === "c" ? "c" : "d",
                  from,
                  to,
                  registerRef,
               );
               anchorPosRef.current = null;
               goalColumnRef.current = null;
               setVimMode(key === "c" ? "insert" : "normal");
               updateCursor(view);
               return true;
            }
            case "y": {
               event.preventDefault();
               const { from, to } = state.selection;
               applyOperator(view, "y", from, to, registerRef);
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
         case "l":
         case "w":
         case "b":
         case "e":
         case "0":
         case "^":
         case "$": {
            event.preventDefault();
            goalColumnRef.current = null;
            const target = resolveMotion(view, key, state.selection.from);
            if (target !== null) {
               dispatch(
                  state.tr.setSelection(
                     TextSelection.create(state.doc, target),
                  ),
               );
               updateCursor(view);
            }
            return true;
         }

         case "g":
            event.preventDefault();
            pendingGRef.current = true;
            clearPendingSoon(pendingGRef, false);
            return true;

         case "G": {
            event.preventDefault();
            dispatch(
               state.tr.setSelection(
                  TextSelection.create(state.doc, state.doc.content.size),
               ),
            );
            updateCursor(view);
            return true;
         }

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

         case "x": {
            event.preventDefault();
            goalColumnRef.current = null;
            const { from } = state.selection;
            if (from < state.doc.content.size)
               applyOperator(view, "d", from, from + 1, registerRef);
            updateCursor(view);
            return true;
         }

         case "X": {
            event.preventDefault();
            goalColumnRef.current = null;
            const { from } = state.selection;
            if (from > 0) applyOperator(view, "d", from - 1, from, registerRef);
            updateCursor(view);
            return true;
         }

         case "D": {
            event.preventDefault();
            const { $from, from } = state.selection;
            applyOperator(view, "d", from, $from.end(), registerRef);
            updateCursor(view);
            return true;
         }

         case "C": {
            event.preventDefault();
            const { $from, from } = state.selection;
            applyOperator(view, "c", from, $from.end(), registerRef);
            setVimMode("insert");
            updateCursor(view);
            return true;
         }

         case "r":
            event.preventDefault();
            pendingReplaceRef.current = true;
            clearPendingSoon(pendingReplaceRef, false);
            return true;

         case "~": {
            event.preventDefault();
            const { from } = state.selection;
            if (from < state.doc.content.size) {
               const ch = state.doc.textBetween(from, from + 1, "\n", "\n");
               const toggled =
                  ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase();
               let tr = state.tr.delete(from, from + 1);
               tr = tr.insertText(toggled, from);
               tr = tr.setSelection(
                  TextSelection.create(
                     tr.doc,
                     Math.min(from + 1, tr.doc.content.size),
                  ),
               );
               dispatch(tr);
            }
            updateCursor(view);
            return true;
         }

         case "u":
            event.preventDefault();
            undo(state, dispatch);
            updateCursor(view);
            return true;

         case "p": {
            event.preventDefault();
            if (registerRef.current) {
               const { from } = state.selection;
               const insertPos = Math.min(from + 1, state.doc.content.size);
               dispatch(state.tr.insertText(registerRef.current, insertPos));
            }
            updateCursor(view);
            return true;
         }

         case "P": {
            event.preventDefault();
            if (registerRef.current) {
               dispatch(
                  state.tr.insertText(
                     registerRef.current,
                     state.selection.from,
                  ),
               );
            }
            updateCursor(view);
            return true;
         }

         case "d":
         case "c":
         case "y":
            event.preventDefault();
            pendingOperatorRef.current = key as "d" | "c" | "y";
            clearPendingSoon(pendingOperatorRef, null);
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
         <ScrollArea className={cn("h-dvh", className)}>
            <div ref={wrapperRef} className="relative">
               <EditorContent editor={editor} />
               {cursorRect && (
                  <div
                     className="absolute pointer-events-none animate-pulse duration-100 bg-foreground/50"
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
      );
   }
}
