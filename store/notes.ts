import { create } from "zustand";
import { NotesStoreType } from "../type/store";

const useNotesStore = create<NotesStoreType>((set) => ({
   notes: [],
   addNote: (title) => {
      set((state) => ({
         notes: [
            ...state.notes,
            {
               content: "",
               createdAt: new Date().toISOString(),
               id: crypto.randomUUID(),
               title,
            },
         ],
      }));
   },
   removeNote: (id) => {
      set((state) => ({
         notes: [...state.notes].filter((item) => item.id !== id),
      }));
   },
   updateNote: (id: string, title: string, content: string) => {
      set((state) => ({
         notes: state.notes.map((item) =>
            item.id === id ? { ...item, title, content } : item,
         ),
      }));
   },
}));

export default useNotesStore;
