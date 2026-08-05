import { VimMode } from "./editor";

export interface EditorStoreType {
   mode: VimMode;
   setMode: (mode: VimMode) => void;
}
