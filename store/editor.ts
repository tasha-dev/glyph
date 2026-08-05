import { create } from "zustand";
import { EditorStoreType } from "../type/store";

const useEditorStore = create<EditorStoreType>((set) => ({
   mode: "normal",
   setMode: (mode) => {
      set({
         mode,
      });
   },
}));

export default useEditorStore;
