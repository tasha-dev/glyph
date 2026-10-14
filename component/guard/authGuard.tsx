"use client";

import { Query, type Models } from "appwrite";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  account,
  DATABASE_ID,
  TABLE_ID,
  tablesDB,
} from "@/lib/appwrite/client";
import type { AuthGuardProps } from "@/type/component";
import { AuthFetchProvider } from "@/context/authFetchContext";
import { Alert, AlertDescription, AlertTitle } from "@/component/ui/alert";
import { isUnauthorized } from "@/lib/util";
import { DBNote } from "@/type/api";
import { UserNotesProvider } from "@/context/userNotesContext";

export default function AuthGuard({
  children,
  mode = "auth-only",
}: AuthGuardProps) {
  const router = useRouter();

  const fetch = useQuery<Models.User<Models.Preferences>, Error>({
    queryKey: ["auth", "current-user"],
    queryFn: () => account.get(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const userNotesFetch = useQuery<DBNote[], Error>({
    queryKey: ["user", "user-notes", fetch.data?.$id],
    enabled: !!fetch.data,
    retry: false,
    queryFn: async (): Promise<DBNote[]> => {
      const user = fetch.data;

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

  const { data: user, error, isPending, isError, isSuccess } = fetch;

  const unauthorized = isError && isUnauthorized(error);
  const authenticated = isSuccess && user !== undefined;

  useEffect(() => {
    if (mode === "no-auth-only" && authenticated) {
      router.replace("/");
    }
  }, [mode, authenticated, router]);

  if (isPending || userNotesFetch.isPending) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        role="status"
        aria-label="Checking authentication"
      >
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && !unauthorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="size-4" />
          <AlertTitle>Authentication failed</AlertTitle>
          <AlertDescription>
            We couldn't verify your session. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userNotesFetch.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed On Notes</AlertTitle>
          <AlertDescription>
            We couldn't get your notes. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const canRender =
    mode === "disabled"
      ? authenticated || unauthorized
      : mode === "auth-only"
        ? authenticated
        : mode === "no-auth-only"
          ? unauthorized
          : false;

  if (!canRender) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        role="status"
        aria-label="Redirecting"
      >
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthFetchProvider value={fetch}>
      <UserNotesProvider value={userNotesFetch}>{children}</UserNotesProvider>
    </AuthFetchProvider>
  );
}
