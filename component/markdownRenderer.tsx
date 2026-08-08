"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { MarkdownRenderProps } from "@/type/component";
import vesperTheme from "@/lib/vesperSyntaxTheme";
import { cn } from "@/lib/util";

export default function MarkdownRenderer({
   children,
   className,
}: MarkdownRenderProps) {
   return (
      <article
         className={cn(
            "prose prose-neutral mx-auto w-full max-w-2xl p-4",
            "dark:prose-invert",
            "[&_table]:border [&_table]:border-border",
            "[&_td]:border [&_td]:border-border",
            "[&_th]:border [&_th]:border-border",
            "[&_td]:p-2 [&_th]:p-2",
            "[&_ul[data-type=taskList]]:list-none",
            "[&_ul[data-type=taskList]]:pl-0",
            "[&_ul[data-type=taskList]]:space-y-1",
            "[&_ul[data-type=taskList]_li]:flex",
            "[&_ul[data-type=taskList]_li]:items-start",
            "[&_ul[data-type=taskList]_li]:gap-2",
            "[&_ul[data-type=taskList]_li>p]:m-0",
            "[&_ul[data-type=taskList]_li>input]:mt-1",
            "[&_a]:text-sky-500 [&_a]:underline",
            "[&_img]:w-full [&_img]:object-cover",
            "[&_img]:rounded-lg [&_img]:block",
            "[&_del]:line-through",
            className,
         )}
      >
         <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
               input({ type, checked, ...props }) {
                  if (type === "checkbox") {
                     return (
                        <input
                           {...props}
                           type="checkbox"
                           checked={checked}
                           readOnly
                           className="mt-1"
                        />
                     );
                  }

                  return <input {...props} type={type} />;
               },

               a({ href, children, ...props }) {
                  return (
                     <a
                        {...props}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        {children}
                     </a>
                  );
               },

               img({ src, alt, ...props }) {
                  if (!src) return null;

                  return (
                     <img {...props} src={src} alt={alt ?? ""} loading="lazy" />
                  );
               },

               code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");

                  if (!match) {
                     return (
                        <code className={className} {...props}>
                           {children}
                        </code>
                     );
                  }

                  return (
                     <ShikiCode
                        language={match[1]}
                        code={String(children).replace(/\n$/, "")}
                     />
                  );
               },
            }}
         >
            {children}
         </ReactMarkdown>
      </article>
   );
}

interface ShikiCodeProps {
   language: string;
   code: string;
}

function ShikiCode({ language, code }: ShikiCodeProps) {
   const [html, setHtml] = useState("");

   useEffect(() => {
      let cancelled = false;

      codeToHtml(code, {
         lang: language,
         themes: {
            light: vesperTheme,
            dark: vesperTheme,
         },
      }).then((result) => {
         if (!cancelled) {
            setHtml(result);
         }
      });

      return () => {
         cancelled = true;
      };
   }, [code, language]);

   if (!html) {
      return (
         <pre>
            <code>{code}</code>
         </pre>
      );
   }

   return (
      <div
         className="not-prose overflow-x-auto rounded-lg"
         dangerouslySetInnerHTML={{ __html: html }}
      />
   );
}
