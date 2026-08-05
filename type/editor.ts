export type VimMode = "normal" | "insert" | "visual" | "disabled";
export interface SelectionWithModify extends Selection {
   modify: (alter: string, direction: string, granularity: string) => void;
}
export interface BlockCursorRect {
   top: number;
   left: number;
   width: number;
   height: number;
}
