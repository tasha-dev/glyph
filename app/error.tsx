"use client";

import { Button } from "@/component/ui/button";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/component/ui/empty";
import { ScrollArea } from "@/component/ui/scroll-area";
import { CloudAlert } from "lucide-react";
import Link from "next/link";
import { ErrorPageProps } from "@/type/component";

export default function ErrorPage({ reset, error }: ErrorPageProps) {
   return (
      <ScrollArea className={"h-dvh"}>
         <div className="min-h-dvh p-4 flex items-center justify-center">
            <Empty className={"p-0 m-0"}>
               <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                     <CloudAlert />
                  </EmptyMedia>
                  <EmptyTitle>500 — Something went wrong</EmptyTitle>
                  <EmptyDescription>
                     An unexpected error occurred while loading this page.
                     Please try again in a moment.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>
                  <div className="prose prose-neutral dark:prose-invert w-full max-w-full my-0">
                     <p>
                        <pre>{error.message}</pre>
                     </p>
                  </div>
                  <div className="flex items-center justify-center flex-wrap gap-3">
                     <Button onClick={reset}>Try Again</Button>
                     <Button
                        variant={"outline"}
                        render={<Link href={"/"}>Go back home</Link>}
                     />
                  </div>
               </EmptyContent>
            </Empty>
         </div>
      </ScrollArea>
   );
}
