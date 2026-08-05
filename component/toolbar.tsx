"use client";

import {
   Code2,
   File,
   FileText,
   Heading,
   List,
   PanelLeft,
   SunMoon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { ClassOnlyProps } from "@/type/component";
import { useTheme } from "next-themes";
import { Kbd } from "./ui/kbd";
import useKeyboard from "@/hook/useKeyboard";
import useEditorStore from "@/store/editor";

export default function Toolbar({ className }: ClassOnlyProps) {
   const { theme, setTheme } = useTheme();
   const { mode } = useEditorStore();

   const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

   useKeyboard("t", toggleTheme, false, mode === "normal");

   return (
      <DropdownMenu>
         <DropdownMenuTrigger
            render={
               <Button
                  size="icon-lg"
                  variant={"secondary"}
                  className={className}
               >
                  <List />
               </Button>
            }
         />
         <DropdownMenuContent className={"w-auto"} sideOffset={10}>
            <DropdownMenuItem className="cursor-pointer">
               <PanelLeft />
               Toggle side bar
               <DropdownMenuShortcut className="ml-auto">
                  <Kbd>o</Kbd>
               </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
               <SunMoon />
               Change Theme
               <DropdownMenuShortcut className="ml-auto">
                  <Kbd>t</Kbd>
               </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
               <FileText />
               Export To PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
               <Heading />
               Export To .md
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
