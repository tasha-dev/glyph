import type { Metadata } from "next";
import { Heading } from "lucide-react";
import SignupForm from "@/component/form/signup";

export const metadata: Metadata = {
  title: "Signup",
};

export default function SignupPage() {
  return (
    <section className="grid lg:grid-cols-2">
      <main className="h-dvh overflow-auto lg:flex items-center justify-center">
        <SignupForm className="lg:max-w-xl w-full mx-auto" />
      </main>
      <div className="h-dvh lg:flex bg-neutral-900 border-l border-foreground/10 hidden items-center justify-center">
        <div className="size-30 flex items-center justify-center rounded-2xl border border-foreground/10 bg-background text-foreground">
          <Heading className="size-15" />
        </div>
      </div>
    </section>
  );
}
