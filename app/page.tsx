import type { Metadata } from "next";
import AuthGuard from "@/component/guard/authGuard";
import EditPageContainer from "@/component/container/editPageContainer";

export const metadata: Metadata = {
  title: "Editor",
};

export default function HomePage() {
  return (
    <AuthGuard mode="disabled">
      <EditPageContainer />
    </AuthGuard>
  );
}
