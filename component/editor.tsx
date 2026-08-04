"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TextSelection } from "@tiptap/pm/state";
import { undo, redo } from "@tiptap/pm/history";
import { EditorView } from "@tiptap/pm/view";
import { useEffect, useRef, useState } from "react";
import { cn, insertImageFile } from "@/lib/util";
import { EditorProps } from "@/type/component";
import { ScrollArea } from "@/component/ui/scroll-area";
import { VimMode, SelectionWithModify, BlockCursorRect } from "@/type/editor";
import {
   applyOperator,
   clearPendingSoon,
   moveVertical,
   resolveMotion,
} from "@/lib/editor";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import vesperTheme from "@/lib/vesperSyntaxTheme";

const INSERT_CURSOR_WIDTH = 2;

export default function MarkdownEditor({
   initialMarkdown = "# Hello world",
   onChange,
   className,
   ref,
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
            case "k":
               event.preventDefault();
               sel?.modify(
                  "extend",
                  key === "j" ? "forward" : "backward",
                  "line",
               );
               updateCursor(view);
               return true;
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
         case "j":
            event.preventDefault();
            sel?.modify("move", "forward", "line");
            updateCursor(view);
            return true;

         case "k":
            event.preventDefault();
            sel?.modify("move", "backward", "line");
            updateCursor(view);
            return true;
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
      extensions: [
         StarterKit.configure({ codeBlock: false }),
         CodeBlockShiki.configure({
            defaultTheme: "vesper",
            customThemes: [vesperTheme],
         }),
         Table.configure({ resizable: true }),
         TableRow,
         TableHeader,
         TableCell,
         TaskList,
         TaskItem.configure({ nested: true }),
         Link.configure({ openOnClick: false, autolink: true }),
         Image,
         Underline,
         Highlight,
         Typography, // smart quotes, em-dashes, (c) → ©, etc.
         Markdown.configure({
            markedOptions: { gfm: true }, // enables tables + task lists in Markdown parsing
         }),
      ],
      content: initialMarkdown,
      contentType: "markdown",
      immediatelyRender: false,
      autofocus: true,
      editorProps: {
         handleKeyDown,
         attributes: {
            spellcheck: "false",
            class: cn(
               "outline-none p-4 prose prose-neutral mx-auto w-full max-w-2xl dark:prose-invert caret-transparent relative selection:bg-foreground selection:text-background",
               "[&_table]:border [&_table]:border-border [&_td]:border [&_td]:border-border [&_th]:border [&_th]:border-border [&_td]:p-2 [&_th]:p-2",
               "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0",
               "[&_a]:text-sky-500 [&_a]:underline",
               "[&_img]:w-full [&_img]:object-cover [&_img]:rounded-lg [&_img]:block",
               "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]]:space-y-1",
               "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2",
               "[&_ul[data-type=taskList]_li>div]:flex-1 [&_ul[data-type=taskList]_li>div>p]:m-0",
               "[&_li[data-checked=true]>div]:line-through [&_li[data-checked=true]>div]:text-foreground/40",
            ),
         },
         handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;
            for (const item of items) {
               if (item.type.startsWith("image/")) {
                  const file = item.getAsFile();
                  if (file) {
                     event.preventDefault();
                     return insertImageFile(view, file);
                  }
               }
            }
            return false;
         },
         handleDrop: (view, event) => {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return false;
            const file = files[0];
            if (!file.type.startsWith("image/")) return false;

            event.preventDefault();
            const coords = { left: event.clientX, top: event.clientY };
            const pos = view.posAtCoords(coords)?.pos;
            return insertImageFile(view, file, pos);
         },
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

   useEffect(() => {
      if (editor) {
         addEventListener("resize", () => updateCursor(editor.view));

         return () => {
            removeEventListener("resize", () => updateCursor(editor.view));
         };
      }
   }, [editor]);

   if (editor) {
      return (
         <ScrollArea className={cn("h-dvh", className)}>
            <div ref={wrapperRef} className="relative">
               <EditorContent ref={ref} editor={editor} />
               {cursorRect && mode !== "visual" && (
                  <div
                     className="absolute pointer-events-none animate-pulse duration-100 bg-foreground/30"
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
