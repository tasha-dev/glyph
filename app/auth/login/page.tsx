import type { Metadata } from "next";
import LoginForm from "@/component/form/login";
import { Heading } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="lg:h-dvh h-32 bg-neutral-900 border-r border-foreground/10 flex items-center justify-center">
        <div className="lg:size-30 size-25 flex items-center justify-center rounded-2xl border border-foreground/10 bg-background text-foreground">
          <Heading className="size-17.5" />
        </div>
      </div>

      <LoginForm className="lg:max-w-xl w-full mx-auto" />
    </section>
  );
}
