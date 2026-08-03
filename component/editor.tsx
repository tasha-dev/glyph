"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

export default function Editor() {
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
      return <EditorContent editor={editor} />;
   }
}
