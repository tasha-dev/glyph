"use client";

import { Code2, List, SunMoon } from "lucide-react";
import { Button } from "./ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { ClassOnlyProps } from "@/type/component";
import { useTheme } from "next-themes";

export default function Toolbar({ className }: ClassOnlyProps) {
   const { theme, setTheme } = useTheme();

   return (
      <DropdownMenu>
         <DropdownMenuTrigger
            render={
               <Button size="icon-lg" variant={"blur"} className={className}>
                  <List />
               </Button>
            }
         />
         <DropdownMenuContent className={"w-[150px]"} sideOffset={10}>
            <DropdownMenuItem
               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
               className="cursor-pointer"
            >
               <SunMoon />
               Change Theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               render={
                  <Link
                     href="https://tasha.vercel.app"
                     className="cursor-pointer"
                     target="_blank"
                  >
                     <Code2 />
                     Mahdi Tasha
                  </Link>
               }
            />
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
