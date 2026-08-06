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
