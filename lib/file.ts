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
