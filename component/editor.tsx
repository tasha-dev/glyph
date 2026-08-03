"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { ClassOnlyProps } from "@/type/component";
import { cn } from "@/lib/util";

export default function Editor({ className }: ClassOnlyProps) {
   const editor = useEditor({
      extensions: [StarterKit, Markdown],
      content: "# Hello world",
      contentType: "markdown",
      immediatelyRender: false,
      editorProps: {
         attributes: {
            class: "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4",
         },
      },
   });

   if (editor) {
      return (
         <EditorContent
            editor={editor}
            className={cn(
               "max-w-full prose prose-neutral dark:prose-invert w-full",
               className,
            )}
         />
      );
   }
}
