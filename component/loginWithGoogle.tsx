"use client";

import { LoginWithGoogleProps } from "@/type/component";
import { Button } from "./ui/button";
import Google from "./ui/icon/google";
import { account } from "@/lib/appwrite/client";
import { OAuthProvider } from "appwrite";
import { toast } from "sonner";

export default function LoginWithGoogle({
  disabled = false,
}: LoginWithGoogleProps) {
  function handleLogin() {
    try {
      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: `${window.location.origin}`,
        failure: `${window.location.origin}/login`,
      });
    } catch {
      toast.error("Unable to start Google login. Please try again.");
    }
  }

  return (
    <Button
      type="button"
      disabled={disabled}
      variant="secondary"
      onClick={handleLogin}
    >
      <Google />
      Continue with Google
    </Button>
  );
}
