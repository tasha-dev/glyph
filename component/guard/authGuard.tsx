"use client";

import { Query, type Models } from "appwrite";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  account,
  DATABASE_ID,
  TABLE_ID,
  tablesDB,
} from "@/lib/appwrite/client";
import type { AuthGuardProps } from "@/type/component";
import { AuthFetchProvider } from "@/context/authFetchContext";
import { UserNotesProvider } from "@/context/userNotesContext";
import { isUnauthorized } from "@/lib/util";
import type { DBNote } from "@/type/api";
import AlertScreen from "../ui/api/alertScreen";
import LoadingScreen from "../ui/api/loadingScreen";

export default function AuthGuard({
  children,
  mode = "auth-only",
}: AuthGuardProps) {
  const router = useRouter();
  const authQuery = useQuery<Models.User<Models.Preferences>, Error>({
    queryKey: ["auth", "current-user"],
    queryFn: () => account.get(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = authQuery.data;
  const authenticated = authQuery.isSuccess && !!user;
  const unauthorized = authQuery.isError && isUnauthorized(authQuery.error);

  const notesQuery = useQuery<DBNote[], Error>({
    queryKey: ["user", "user-notes", user?.$id],
    enabled: authenticated && mode !== "no-auth-only",
    retry: false,
    queryFn: async (): Promise<DBNote[]> => {
      if (!user) {
        throw new Error("No authenticated user");
      }

      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [Query.equal("userId", user.$id)],
      });

      return response.rows.map((row) => ({
        $id: row.$id,
        $createdAt: row.$createdAt,
        $updatedAt: row.$updatedAt,
        $permissions: row.$permissions,
        $sequence: row.$sequence,
        $tableId: row.$tableId,
        $databaseId: row.$databaseId,
        title: row.title,
        content: row.content,
        userId: row.userId,
      }));
    },
  });

  useEffect(() => {
    if (mode === "auth-only" && unauthorized) {
      router.replace("/login");
    }
  }, [mode, unauthorized, router]);

  if (authQuery.isPending) {
    return <LoadingScreen label="Checking authentication" />;
  }

  if (authQuery.isError && !unauthorized) {
    return (
      <AlertScreen
        title="Authentication failed"
        description="We couldn't verify your session. Please try again."
        variant="destructive"
      />
    );
  }

  if (unauthorized) {
    switch (mode) {
      case "auth-only":
        return <LoadingScreen label="Redirecting to login" />;
      case "no-auth-only":
      case "disabled":
        return (
          <AuthFetchProvider value={authQuery}>
            <UserNotesProvider value={notesQuery}>{children}</UserNotesProvider>
          </AuthFetchProvider>
        );
    }
  }

  switch (mode) {
    case "no-auth-only":
      return (
        <AlertScreen
          title="Already signed in"
          description="You are already signed in. Please continue to the application."
          variant="default"
        />
      );

    case "auth-only":
    case "disabled":
      break;
  }

  if (notesQuery.isPending) {
    return <LoadingScreen label="Loading your notes" />;
  }

  if (notesQuery.isError) {
    return (
      <AlertScreen
        title="Failed to load notes"
        description="We couldn't retrieve your notes. Please try again."
        variant="destructive"
      />
    );
  }

  return (
    <AuthFetchProvider value={authQuery}>
      <UserNotesProvider value={notesQuery}>{children}</UserNotesProvider>
    </AuthFetchProvider>
  );
}
