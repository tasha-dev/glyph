"use client";

import { useEffect } from "react";

export default function useKeyboard(
   key: string,
   handler: () => void,
   ctrl?: boolean,
   condition?: boolean,
) {
   useEffect(() => {
      function eventHandlerFn(e: KeyboardEvent) {
         const activeElement = document.activeElement;

         if (activeElement && activeElement.tagName.toLowerCase() !== "input") {
            if (condition) {
               if (ctrl) {
                  if (e.key.toLowerCase() === key.toLowerCase() && e.ctrlKey) {
                     e.preventDefault();
                     handler();
                  }
               } else {
                  if (e.key.toLowerCase() === key.toLowerCase()) {
                     e.preventDefault();
                     handler();
                  }
               }
            }
         }
      }

      addEventListener("keydown", eventHandlerFn);

      return () => removeEventListener("keydown", eventHandlerFn);
   }, [key, handler]);
}
