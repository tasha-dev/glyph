"use client";

import { isExpirationValid } from "@/lib/util";
import type { RecoverContainerProps } from "@/type/component";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import RecoveryForm from "../form/recovery";

export default function RecoveryPageContainer({
  userId,
  expire,
  secret,
}: RecoverContainerProps) {
  const router = useRouter();
  const isValid = Boolean(userId && secret && isExpirationValid(expire));

  useEffect(() => {
    if (!isValid) {
      toast.error("Invalid recovery link", {
        description:
          "This password recovery link is invalid or expired. Please request a new one.",
      });

      router.replace("/auth/login");
    }
  }, [isValid, router]);

  if (isValid) {
    return (
      <section>
        <main className="flex items-center justify-center lg:h-dvh">
          <RecoveryForm className="mx-auto h-dvh w-full overflow-auto rounded-none bg-transparent ring-0 lg:h-auto lg:max-w-xl lg:overflow-hidden lg:rounded-xl lg:bg-card lg:ring-1" />
        </main>
      </section>
    );
  }
}
