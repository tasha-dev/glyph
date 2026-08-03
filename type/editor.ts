export type VimMode = "normal" | "insert";
export type SelectionWithModify = Selection & {
   modify: (alter: string, direction: string, granularity: string) => void;
};

export interface BlockCursorRect {
   top: number;
   left: number;
   width: number;
   height: number;
}
