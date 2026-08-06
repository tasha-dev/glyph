import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NotesStoreType } from "../type/store";

const useNotesStore = create<NotesStoreType>()(
   persist(
      (set) => ({
         notes: [],
         addNote: (title) => {
            set((state) => ({
               notes: [
                  ...state.notes,
                  {
                     id: crypto.randomUUID(),
                     title,
                     content: "",
                     createdAt: new Date().toISOString(),
                  },
               ],
            }));
         },
         removeNote: (id) => {
            set((state) => ({
               notes: state.notes.filter((item) => item.id !== id),
            }));
         },
         updateNote: (id, title, content) => {
            set((state) => ({
               notes: state.notes.map((item) =>
                  item.id === id ? { ...item, title, content } : item,
               ),
            }));
         },
      }),
      {
         name: "glyph-notes",
         partialize: (state) => ({
            notes: state.notes,
         }),
      },
   ),
);

export default useNotesStore;
