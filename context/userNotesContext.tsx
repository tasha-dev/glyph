"use client";

import {
  UserNotesContextProviderProps,
  UserNotesContextValue,
} from "@/type/context";
import { createContext, useContext } from "react";

const UserNotesContext = createContext<UserNotesContextValue | null>(null);

export function UserNotesProvider({
  value,
  children,
}: UserNotesContextProviderProps) {
  return (
    <UserNotesContext.Provider value={value}>
      {children}
    </UserNotesContext.Provider>
  );
}

export function useUserNotes() {
  const context = useContext(UserNotesContext);

  if (!context) {
    throw new Error("useUserNotes must be used within UserNotesProvider");
  }

  return context;
}
