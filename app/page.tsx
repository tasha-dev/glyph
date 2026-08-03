import Editor from "@/component/editor";
import ThemeToggler from "@/component/themeToggler";

export default function HomePage() {
   return (
      <section className="relative z-0">
         <ThemeToggler className="fixed top-3 right-3 z-10" />
         <main>
            <Editor />
         </main>
      </section>
   );
}
