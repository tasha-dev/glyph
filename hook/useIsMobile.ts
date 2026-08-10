"use client";

import { useEffect, useState } from "react";

export function useIsMobile() {
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const update = () => {
         const isTouchDevice =
            "ontouchstart" in window || navigator.maxTouchPoints > 0;

         setIsMobile(isTouchDevice);
      };

      update();
   }, []);

   return isMobile;
}
