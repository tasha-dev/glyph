"use client";

import { ClassOnlyProps } from "@/type/component";
import Link from "next/link";
import {
  CardHeader,
  Card,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/component/ui/card";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { loginFormSchema, loginFormType } from "@/lib/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Field, FieldError, FieldLabel } from "@/component/ui/field";
import { cn } from "@/lib/util";
import { Loader2, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { account } from "@/lib/appwrite/client";
import { toast } from "sonner";
import { AppwriteException } from "appwrite";
import { useRouter } from "next/navigation";
import LoginWithGoogle from "../loginWithGoogle";

export default function LoginForm({ className }: ClassOnlyProps) {
  const router = useRouter();
  const form = useForm<loginFormType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({ email, password }: loginFormType) =>
      account.createEmailPasswordSession({
        email,
        password,
      }),
  });

  const recoveryMutation = useMutation({
    mutationFn: (email: string) =>
      account.createRecovery({
        email,
        url: `${window.location.origin}/auth/recovery`,
      }),
  });

  const onSubmit: SubmitHandler<loginFormType> = async (data) => {
    try {
      await mutation.mutateAsync(data);

      toast.success(
        "You've successfully signed in to your account. Welcome back!",
      );
      router.push("/");
    } catch (err) {
      const error = err as AppwriteException;
      toast.error(error.message);
    }
  };

  return (
    <Card
      className={cn(
        "rounded-none bg-background outline-none border-0 ring-0",
        className,
      )}
    >
      <CardHeader className="mb-6">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to sync your Markdown documents across devices.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-5.5 space-y-4 mb-8">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant={"link"}
              className={"px-0"}
              size={"xs"}
              disabled={
                form.formState.isSubmitting || recoveryMutation.isPending
              }
              onClick={async () => {
                const isValid = await form.trigger("email");

                if (isValid) {
                  const email = form.getValues("email");

                  try {
                    await recoveryMutation.mutateAsync(email);
                    toast.success(
                      "If an account exists with this email, you'll receive instructions to reset your password.",
                    );
                  } catch (err) {
                    const error = err as AppwriteException;
                    toast.error(error.message);
                  }
                }
              }}
            >
              Forgot password?
            </Button>
          </div>
        </div>
        <CardFooter className="grid gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Sign in
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex-1 border-b border-b-foreground/10 w-full h-0" />
            <span className="text-sm font-normal shrink-0 text-muted-foreground">
              or continue with
            </span>
            <div className="flex-1 border-b border-b-foreground/10 w-full h-0" />
          </div>
          <LoginWithGoogle disabled={form.formState.isSubmitting} />
          <p className="text-sm font-normal shrink-0 text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-foreground">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
