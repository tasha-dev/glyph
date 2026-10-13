"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Models } from "appwrite";

type AuthFetchContextValue = UseQueryResult<
  Models.User<Models.Preferences>,
  Error
>;

const AuthFetchContext = createContext<AuthFetchContextValue | null>(null);

export function AuthFetchProvider({
  value,
  children,
}: {
  value: AuthFetchContextValue;
  children: ReactNode;
}) {
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
