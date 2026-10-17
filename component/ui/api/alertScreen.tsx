import { AlertScreenProps } from "@/type/component";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/component/ui/alert";

export default function AlertScreen({
  title,
  description,
  variant,
}: AlertScreenProps) {
  const Icon = variant === "destructive" ? AlertCircle : Info;

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Alert variant={variant} className="w-full max-w-md">
        <Icon className="size-4" aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
