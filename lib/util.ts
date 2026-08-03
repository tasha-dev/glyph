import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EditorView } from "@tiptap/pm/view";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function charAt(view: EditorView, pos: number): string {
   const size = view.state.doc.content.size;
   if (pos < 0 || pos >= size) return "";
   try {
      return view.state.doc.textBetween(pos, pos + 1, "\n", "\n");
   } catch {
      return "";
   }
}

export const isWordCh = (c: string) => /\w/.test(c);
export const isSpaceCh = (c: string) => c === "" || /\s/.test(c);

export function wordForwardPos(view: EditorView, pos: number): number {
   const size = view.state.doc.content.size;
   let p = pos;
   if (isWordCh(charAt(view, p))) {
      while (p < size && isWordCh(charAt(view, p))) p++;
   } else if (!isSpaceCh(charAt(view, p))) {
      while (
         p < size &&
         !isWordCh(charAt(view, p)) &&
         !isSpaceCh(charAt(view, p))
      )
         p++;
   }
   while (p < size && isSpaceCh(charAt(view, p))) p++;
   return Math.min(p, size);
}

export function wordBackwardPos(view: EditorView, pos: number): number {
   let p = pos;
   if (p > 0) p--;
   while (p > 0 && isSpaceCh(charAt(view, p))) p--;
   if (isWordCh(charAt(view, p))) {
      while (p > 0 && isWordCh(charAt(view, p - 1))) p--;
   } else {
      while (
         p > 0 &&
         !isWordCh(charAt(view, p - 1)) &&
         !isSpaceCh(charAt(view, p - 1))
      )
         p--;
   }
   return Math.max(p, 0);
}

export function wordEndPos(view: EditorView, pos: number): number {
   const size = view.state.doc.content.size;
   let p = pos + 1;
   while (p < size && isSpaceCh(charAt(view, p))) p++;
   if (isWordCh(charAt(view, p))) {
      while (p < size - 1 && isWordCh(charAt(view, p + 1))) p++;
   } else {
      while (
         p < size - 1 &&
         !isWordCh(charAt(view, p + 1)) &&
         !isSpaceCh(charAt(view, p + 1))
      )
         p++;
   }
   return Math.min(p, size);
}

export function insertImageFile(view: EditorView, file: File, pos?: number) {
   if (!file.type.startsWith("image/")) return false;

   const reader = new FileReader();
   reader.onload = () => {
      const src = reader.result as string; // data:image/png;base64,...
      const { schema } = view.state;
      const node = schema.nodes.image.create({ src });
      const insertPos = pos ?? view.state.selection.from;
      const tr = view.state.tr.insert(insertPos, node);
      view.dispatch(tr);
   };
   reader.readAsDataURL(file);
   return true;
}
