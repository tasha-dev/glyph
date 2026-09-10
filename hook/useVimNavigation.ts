import { UseVimNavigationOptions } from "@/type/hook";
import {
   useCallback,
   useEffect,
   useRef,
   useState,
   type RefObject,
} from "react";

export default function useVimNavigation<T extends HTMLElement = HTMLElement>(
   containerRef: RefObject<T | null>,
   options: UseVimNavigationOptions = {},
) {
   const {
      itemSelector = "[data-vim-item]",
      columns,
      loop = false,
      onSelect,
      disabled = false,
   } = options;

   const [activeIndex, setActiveIndex] = useState(0);
   const itemsRef = useRef<HTMLElement[]>([]);

   const refreshItems = useCallback(() => {
      if (!containerRef.current) return [];
      const items = Array.from(
         containerRef.current.querySelectorAll<HTMLElement>(itemSelector),
      );
      itemsRef.current = items;
      return items;
   }, [containerRef, itemSelector]);

   const focusIndex = useCallback(
      (index: number) => {
         const items = itemsRef.current;
         if (items.length === 0) return;

         const next = loop
            ? ((index % items.length) + items.length) % items.length
            : Math.max(0, Math.min(index, items.length - 1));

         items.forEach((el, i) =>
            el.setAttribute("tabindex", i === next ? "0" : "-1"),
         );
         items[next]?.focus();
         setActiveIndex(next);
      },
      [loop],
   );

   useEffect(() => {
      if (disabled) return;
      const container = containerRef.current;
      if (!container) return;

      refreshItems();
      itemsRef.current.forEach((el, i) =>
         el.setAttribute("tabindex", i === activeIndex ? "0" : "-1"),
      );

      const handleKeyDown = (e: KeyboardEvent) => {
         const target = e.target as HTMLElement;
         // don't hijack real inputs / editable fields
         if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
         ) {
            return;
         }

         const items = itemsRef.current;
         if (items.length === 0) return;

         switch (e.key) {
            case "j":
            case "ArrowDown":
               e.preventDefault();
               focusIndex(activeIndex + (columns ?? 1));
               break;
            case "k":
            case "ArrowUp":
               e.preventDefault();
               focusIndex(activeIndex - (columns ?? 1));
               break;
            case "h":
            case "ArrowLeft":
               e.preventDefault();
               focusIndex(activeIndex - 1);
               break;
            case "l":
            case "ArrowRight":
               e.preventDefault();
               focusIndex(activeIndex + 1);
               break;
            case "g":
               e.preventDefault();
               focusIndex(0); // "gg" simplified to single g; see note below
               break;
            case "G":
               e.preventDefault();
               focusIndex(items.length - 1);
               break;
            case "Enter":
            case "o":
               e.preventDefault();
               onSelect?.(activeIndex, items[activeIndex]);
               break;
            default:
               return;
         }
      };

      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
   }, [
      activeIndex,
      columns,
      disabled,
      focusIndex,
      onSelect,
      refreshItems,
      containerRef,
   ]);

   return { activeIndex, refreshItems };
}
