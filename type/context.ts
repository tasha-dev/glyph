import type { UseQueryResult } from "@tanstack/react-query";
import type { Models } from "appwrite";
import { DBNote } from "./api";

export type AuthFetchContextValue = UseQueryResult<
  Models.User<Models.Preferences>,
  Error
>;

export type UserNotesContextValue = UseQueryResult<DBNote[], Error>;
export interface AuthFetchContextProviderProps {
  value: AuthFetchContextValue;
  children: React.ReactNode;
}

export interface UserNotesContextProviderProps {
  value: UserNotesContextValue;
  children: React.ReactNode;
}
