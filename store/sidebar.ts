import { create } from "zustand";
import { SideBarStoreType } from "../type/store";

const useSideBarStore = create<SideBarStoreType>((set) => ({
   open: false,
   toggle: () => {
      set((state) => ({
         open: !state.open,
      }));
   },
}));

export default useSideBarStore;
