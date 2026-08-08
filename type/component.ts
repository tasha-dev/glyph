import { Note } from "@/store/general";

export interface RootLayoutProps {
   children: React.ReactNode;
}

export interface ClassOnlyProps {
   className?: string;
}

export interface EditorProps {
   className?: string;
   initialMarkdown?: string;
   onChange?: (markdown: string) => void;
   ref?: React.RefObject<HTMLDivElement | null>;
   disabled?: boolean;
}

export interface ErrorPageProps {
   reset: () => void;
   error: Error & {
      digest?: string;
   };
}

export interface NoteItemProps {
   className?: string;
   data: Note;
}

export interface EditNoteProps {
   className?: string;
   data: Note;
}

export interface MarkdownRenderProps {
   children: string;
   className?: string;
}
