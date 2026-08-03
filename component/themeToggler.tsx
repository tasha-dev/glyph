"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { SunMoon } from "lucide-react";
import { ClassOnlyProps } from "@/type/component";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ThemeToggler({ className }: ClassOnlyProps) {
   const { theme, setTheme } = useTheme();

   return (
      <Tooltip>
         <TooltipTrigger
            render={
               <Button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  size="icon-lg"
                  variant={"blur"}
                  className={className}
               >
                  <SunMoon />
               </Button>
            }
         />
         <TooltipContent sideOffset={10}>Toggle Theme</TooltipContent>
      </Tooltip>
   );
}
