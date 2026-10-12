import type { Metadata } from "next";
import LoginForm from "@/component/form/login";
import { Heading } from "lucide-react";
import AuthGuard from "@/component/guard/authGuard";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthGuard mode="no-auth-only">
      <section className="grid lg:grid-cols-2">
        <div className="h-dvh lg:flex bg-neutral-900 border-r border-foreground/10 hidden items-center justify-center">
          <div className="size-30 flex items-center justify-center rounded-2xl border border-foreground/10 bg-background text-foreground">
            <Heading className="size-15" />
          </div>
        </div>
        <main className="h-dvh overflow-auto lg:flex items-center justify-center">
          <LoginForm className="lg:max-w-xl w-full mx-auto" />
        </main>
      </section>
    </AuthGuard>
  );
}
