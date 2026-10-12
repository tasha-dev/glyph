"use client";

import { ClassOnlyProps, RecoveryFormProps } from "@/type/component";
import {
  CardHeader,
  Card,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/component/ui/card";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { recoveryFormSchema, recoveryFormType } from "@/lib/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Field, FieldError, FieldLabel } from "@/component/ui/field";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { account } from "@/lib/appwrite/client";
import { toast } from "sonner";
import { AppwriteException } from "appwrite";
import { useRouter } from "next/navigation";

export default function RecoveryForm({
  className,
  secret,
  userId,
}: RecoveryFormProps) {
  const router = useRouter();
  const form = useForm<recoveryFormType>({
    resolver: zodResolver(recoveryFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const recoveryMutation = useMutation({
    mutationFn: (data: recoveryFormType) =>
      account.updateRecovery({
        password: data.password,
        secret,
        userId,
      }),
  });

  const onSubmit: SubmitHandler<recoveryFormType> = async (data) => {
    try {
      await recoveryMutation.mutateAsync(data);
      toast.success(
        "Your password has been changed successfully. You can now log in with your new password.",
      );

      router.push("/auth/login");
    } catch (err) {
      const error = err as AppwriteException;
      toast.error(error.message);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter the email address associated with your account. We'll send you a
          link to reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-5.5 space-y-4 mb-8">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <CardFooter className="grid gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Reset your password
          </Button>
          <p className="text-sm font-normal shrink-0 text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/login" className="font-bold text-foreground">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
