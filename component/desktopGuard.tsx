"use client";

import { useIsMobile } from "@/hook/useIsMobile";
import { DesktopGuardProps } from "@/type/component";
import { ScrollArea } from "./ui/scroll-area";
import { LaptopMinimal } from "lucide-react";
import {
   Empty,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "./ui/empty";

export default function DesktopGuard({ children }: DesktopGuardProps) {
   const isMobile = useIsMobile();

   if (!isMobile) return children;
   else {
      return (
         <ScrollArea className={"h-dvh overflow-auto p-4"}>
            <div className="min-h-dvh flex items-center justify-center  max-w-2xl mx-auto">
               <Empty className="p-0 m-0 rounded-0">
                  <EmptyHeader>
                     <EmptyMedia variant="icon">
                        <LaptopMinimal />
                     </EmptyMedia>
                     <EmptyTitle>Touch devices aren't supported</EmptyTitle>
                     <EmptyDescription>
                        This app is designed for keyboard and mouse interaction.
                        Please open it on a desktop or laptop to continue.
                     </EmptyDescription>
                  </EmptyHeader>
               </Empty>
            </div>
         </ScrollArea>
      );
   }
}
