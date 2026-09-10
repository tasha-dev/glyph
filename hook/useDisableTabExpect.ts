import { TouchedElement } from "@/type/hook";
import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
   'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function useDisableTabExcept<
   T extends HTMLElement = HTMLElement,
>(excludeRef: RefObject<T | null>, condition: boolean) {
   useEffect(() => {
      if (!condition) return;

      const excludeEl = excludeRef.current;
      const allFocusable = Array.from(
         document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      const touched: TouchedElement[] = [];

      allFocusable.forEach((el) => {
         if (excludeEl && excludeEl.contains(el)) return;

         touched.push({ el, prevTabIndex: el.getAttribute("tabindex") });
         el.setAttribute("tabindex", "-1");
      });

      return () => {
         touched.forEach(({ el, prevTabIndex }) => {
            if (prevTabIndex === null) {
               el.removeAttribute("tabindex");
            } else {
               el.setAttribute("tabindex", prevTabIndex);
            }
         });
      };
   }, [condition, excludeRef]);
}
