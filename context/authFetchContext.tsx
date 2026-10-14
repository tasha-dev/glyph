"use client";

import {
  AuthFetchContextProviderProps,
  AuthFetchContextValue,
} from "@/type/context";
import { createContext, useContext } from "react";

const AuthFetchContext = createContext<AuthFetchContextValue | null>(null);

export function AuthFetchProvider({
  value,
  children,
}: AuthFetchContextProviderProps) {
  return (
    <AuthFetchContext.Provider value={value}>
      {children}
    </AuthFetchContext.Provider>
  );
}

export function useAuthFetch() {
  const context = useContext(AuthFetchContext);

  if (!context) {
    throw new Error("useAuthFetch must be used within AuthFetchProvider");
  }

  return context;
}
