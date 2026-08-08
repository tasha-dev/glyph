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
import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
   title: "Not Found",
   description: "Page not found",
};

export default function NotFoundPage() {
   return (
      <ScrollArea className={"h-dvh"}>
         <div className="min-h-dvh p-4 flex items-center justify-center">
            <Empty className={"p-0 m-0"}>
               <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                     <FileQuestion />
                  </EmptyMedia>
                  <EmptyTitle>404 — Page Not Found</EmptyTitle>
                  <EmptyDescription>
                     The page you're looking for doesn't exist, may have been
                     moved, or the URL might be incorrect.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>
                  <Button render={<Link href={"/"}>Go back home</Link>} />
               </EmptyContent>
            </Empty>
         </div>
      </ScrollArea>
   );
}
