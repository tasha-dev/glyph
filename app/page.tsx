import Editor from "@/component/editor";

export default function HomePage() {
   return (
      <section className="mx-auto max-w-2xl p-4">
         <main className="max-w-full prose prose-neutral dark:prose-invert w-full">
            <Editor />
         </main>
      </section>
   );
}
