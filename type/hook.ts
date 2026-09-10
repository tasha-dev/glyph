export interface TouchedElement {
   el: HTMLElement;
   prevTabIndex: string | null;
}

export interface UseVimNavigationOptions {
   itemSelector?: string;
   columns?: number;
   loop?: boolean;
   onSelect?: (index: number, element: HTMLElement) => void;
   disabled?: boolean;
}
