import { GooglePageProps } from "@/type/component";
import { redirect } from "next/navigation";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyContent,
  EmptyDescription,
} from "@/component/ui/empty";
import { ArrowRight, CircleAlert, CircleCheck, RefreshCw } from "lucide-react";
import { Button } from "@/component/ui/button";
import Link from "next/link";

export default async function Google({ searchParams }: GooglePageProps) {
  const { status } = await searchParams;

  const isStatusUnrecognizable = status !== "success" && status !== "failure";
  const isStatusInvalid = status === undefined || isStatusUnrecognizable;

  if (isStatusInvalid) redirect("/auth/login");
  else {
    return (
      <section>
        <main className="flex items-center justify-center lg:h-dvh">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {status === "success" ? (
                  <CircleCheck className="text-emerald-600" />
                ) : (
                  <CircleAlert className="text-destructive" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {status === "success"
                  ? "You're all set!"
                  : "Sign-in unsuccessful"}
              </EmptyTitle>
              <EmptyDescription>
                {status === "success"
                  ? "Your Google account has been connected successfully. You're now signed in and ready to continue."
                  : "We couldn't sign you in with Google. Please try again, or return to the login page and use another sign-in method."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {status === "success" ? (
                <Button
                  className="w-full"
                  render={
                    <Link href={"/"}>
                      Create syncable notes
                      <ArrowRight />
                    </Link>
                  }
                />
              ) : (
                <Button
                  className="w-full"
                  render={
                    <Link href={"/auth/login"}>
                      <RefreshCw data-icon="inline-start" />
                      Try again
                    </Link>
                  }
                />
              )}
            </EmptyContent>
          </Empty>
        </main>
      </section>
    );
  }
}
