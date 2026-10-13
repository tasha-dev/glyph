import type { Metadata } from "next";
import { RecoveryPageProps } from "@/type/component";
import RecoveryPageContainer from "@/component/container/recovery";
import AuthGuard from "@/component/guard/authGuard";

export const metadata: Metadata = {
  title: "Recovery",
};

export default async function RecoveryPage({
  searchParams,
}: RecoveryPageProps) {
  const { userId, secret, expire } = await searchParams;

  return (
    <AuthGuard mode="no-auth-only">
      <RecoveryPageContainer expire={expire} secret={secret} userId={userId} />
    </AuthGuard>
  );
}
