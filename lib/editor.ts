import type { EditorView } from "@tiptap/pm/view";
import { TextSelection } from "@tiptap/pm/state";
import { wordBackwardPos, wordEndPos, wordForwardPos } from "./util";
import type { MutableRefObject } from "react";

export function resolveMotion(
   view: EditorView,
   key: string,
   pos: number,
): number | null {
   const { state } = view;
   const size = state.doc.content.size;
   switch (key) {
      case "h":
         return Math.max(0, pos - 1);
      case "l":
         return Math.min(size, pos + 1);
      case "w":
         return wordForwardPos(view, pos);
      case "b":
         return wordBackwardPos(view, pos);
      case "e":
         return wordEndPos(view, pos);
      case "0":
      case "^":
         return state.doc.resolve(pos).start();
      case "$":
         return state.doc.resolve(pos).end();
      case "G":
         return size;
      default:
         return null;
   }
}

export function moveVertical(
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

export function applyOperator(
   view: EditorView,
   operator: "d" | "c" | "y",
   from: number,
   to: number,
   registerRef: MutableRefObject<string>,
) {
   const { state, dispatch } = view;
   const start = Math.min(from, to);
   const end = Math.max(from, to);
   if (start === end) return;
   registerRef.current = state.doc.textBetween(start, end, "\n", "\n");
   if (operator === "y") {
      dispatch(state.tr.setSelection(TextSelection.create(state.doc, start)));
      return;
   }
   dispatch(state.tr.delete(start, end));
}

export function clearPendingSoon<T>(
   ref: MutableRefObject<T>,
   resetValue: T,
   ms = 700,
) {
   setTimeout(() => {
      ref.current = resetValue;
   }, ms);
}
