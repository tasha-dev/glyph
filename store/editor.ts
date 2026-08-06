import { create } from "zustand";
import { EditorStoreType } from "../type/store";

const useEditorStore = create<EditorStoreType>((set) => ({
   mode: "disabled",
   disabled: false,
   setDisabled: (disabled) => {
      set({
         disabled,
         mode: disabled ? "disabled" : "normal",
      });
   },
   setMode: (mode) => {
      set({
         mode,
      });
   },
}));

export default useEditorStore;
