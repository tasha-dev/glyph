import { OAuthProvider } from "appwrite";
import { account } from "./client";

export function loginWithGoogle() {
  return account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success: `${window.location.origin}`,
    failure: `${window.location.origin}/login`,
  });
}
