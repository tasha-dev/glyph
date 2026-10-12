"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { AppwriteException } from "appwrite";
import { Loader2, AlertCircleIcon } from "lucide-react";

import { account } from "@/lib/appwrite/client";
import type { AuthGuardProps, ChildrenOnlyProps } from "@/type/component";
import type { AppwriteUser } from "@/type/api";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/component/ui/alert";
import { Button } from "@/component/ui/button";
import { ScrollArea } from "@/component/ui/scroll-area";

import { createContext } from "react";

export const AuthFetchContext = createContext<
  UseQueryResult<AppwriteUser, AppwriteException> | undefined
>(undefined);

function AlertHolder({ children }: ChildrenOnlyProps) {
  return (
    <ScrollArea className="h-dvh">
      <div className="flex min-h-dvh items-center justify-center p-4">
        {children}
      </div>
    </ScrollArea>
  );
}

function LoadingScreen() {
  return (
    <main
      className="flex h-dvh items-center justify-center p-4"
      role="status"
      aria-label="Loading user session"
    >
      <Loader2 className="size-5 animate-spin text-foreground" />
    </main>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <AlertHolder>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to load your session</AlertTitle>
        <AlertDescription>
          We couldn't verify your session. Check your internet connection and
          try again.
        </AlertDescription>
        <AlertAction>
          <Button onClick={onRetry}>Retry</Button>
        </AlertAction>
      </Alert>
    </AlertHolder>
  );
}

function SignedInScreen() {
  return (
    <AlertHolder>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Already signed in</AlertTitle>
        <AlertDescription>
          You're currently signed in. Please sign out of your account to access
          this page.
        </AlertDescription>
      </Alert>
    </AlertHolder>
  );
}

export default function AuthGuard({
  children,
  mode = "auth-only",
}: AuthGuardProps) {
  const router = useRouter();

  const authFetch = useQuery<AppwriteUser, AppwriteException>({
    queryKey: ["user-info"],
    queryFn: () => account.get(),
    retry: false,
  });

  const isUnauthorized = authFetch.isError && authFetch.error.code === 401;

  const isAuthenticated = authFetch.isSuccess;

  useEffect(() => {
    if (mode === "auth-only" && isUnauthorized) {
      router.replace("/auth/login");
    }
  }, [mode, isUnauthorized, router]);

  if (authFetch.isPending || authFetch.isLoading) {
    return <LoadingScreen />;
  }

  if (authFetch.isError && !isUnauthorized) {
    return <ErrorScreen onRetry={() => void authFetch.refetch()} />;
  }

  if (mode === "auth-only") {
    if (isUnauthorized) {
      return <LoadingScreen />;
    }

    return (
      <AuthFetchContext.Provider value={authFetch}>
        {children}
      </AuthFetchContext.Provider>
    );
  }

  if (mode === "disabled") {
    if (isAuthenticated) {
      return <SignedInScreen />;
    }

    return (
      <AuthFetchContext.Provider value={authFetch}>
        {children}
      </AuthFetchContext.Provider>
    );
  }

  // Disabled mode: render children regardless of authentication status.
  return (
    <AuthFetchContext.Provider value={authFetch}>
      {children}
    </AuthFetchContext.Provider>
  );
}
