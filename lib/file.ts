import { toast } from "sonner";

export const exportMarkdown = (name: string, content: string) => {
   const markdown = content.replace(/\\n/g, "\n");

   const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
   });

   const url = URL.createObjectURL(blob);

   const a = document.createElement("a");

   a.href = url;
   a.download = `${name}.md`;
   document.body.appendChild(a);

   a.click();
   a.remove();

   URL.revokeObjectURL(url);
};

export const printWithDelay = () => {
   toast.promise(
      new Promise<void>((resolve) => {
         setTimeout(() => {
            window.print();
            resolve();
         }, 3000);
      }),
      {
         loading: "Preparing document for printing...",
         success: "Print dialog opened",
         error: "Failed to prepare printing",
      },
   );
};
