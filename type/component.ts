import { Note } from "@/store/general";

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

export interface RecoveryPageProps {
  searchParams: Promise<{
    userId?: string;
    secret?: string;
    expire?: string;
  }>;
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

export interface RecoverContainerProps {
  userId?: string;
  secret?: string;
  expire?: string;
}

export interface ChildrenOnlyProps {
  children: React.ReactNode;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  mode?: "auth-only" | "disabled" | "no-auth-only";
}
