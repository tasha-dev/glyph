"use client";

import Editor from "@/component/editor";
import Toolbar from "@/component/toolbar";
import { useRef } from "react";

export default function HomePage() {
   const editorRef = useRef<HTMLDivElement | null>(null);

   return (
      <section className="relative z-0">
         <Toolbar className="fixed top-2 right-2 z-10" />
         <main onClick={() => editorRef.current?.focus()}>
            <Editor ref={editorRef} />
         </main>
      </section>
   );
}
