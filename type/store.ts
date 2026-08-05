import { VimMode } from "./editor";

export interface EditorStoreType {
   mode: VimMode;
   disabled: boolean;
   setMode: (mode: VimMode) => void;
   setDisabled: (disabled: boolean) => void;
   activeNoteId?: string;
}

export interface SideBarStoreType {
   open: boolean;
   toggle: () => void;
}

export interface NotesStoreType {
   notes: {
      id: string;
      title: string;
      content: string;
      createdAt: string; // ISO
   }[];
   addNote: (title: string) => void;
   removeNote: (id: string) => void;
   updateNote: (id: string, title: string, content: string) => void;
}
