import { LoadingScreenProps } from "@/type/component";
import { Loader2 } from "lucide-react";

export default function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      role="status"
      aria-label={label}
    >
      <Loader2
        className="size-7 animate-spin text-primary"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
