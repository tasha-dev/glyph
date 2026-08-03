import Editor from "@/component/editor";
import ThemeToggler from "@/component/themeToggler";

export default function HomePage() {
   return (
      <section className="mx-auto max-w-2xl p-4 relative z-0">
         <ThemeToggler className="fixed bottom-3 right-3 z-10" />
         <main>
            <Editor />
         </main>
      </section>
   );
}
