"use client";

import Editor from "@/component/editor";
import ThemeToggler from "@/component/themeToggler";
import { useRef } from "react";

export default function HomePage() {
   const editorRef = useRef<HTMLDivElement | null>(null);

   return (
      <section className="relative z-0">
         <ThemeToggler className="fixed top-3 right-3 z-10" />
         <main onClick={() => editorRef.current?.focus()}>
            <Editor ref={editorRef} />
         </main>
      </section>
   );
}
