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
import { signupFormSchema, signupFormType } from "@/lib/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Field, FieldError, FieldLabel } from "@/component/ui/field";
import { cn } from "@/lib/util";
import Google from "../ui/icon/google";
import { Loader2, Send } from "lucide-react";

export default function SignupForm({ className }: ClassOnlyProps) {
  const form = useForm<signupFormType>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<signupFormType> = async (data) => {
    console.log(data);
  };

  return (
    <Card
      className={cn(
        "rounded-none bg-background outline-none border-0 ring-0",
        className,
      )}
    >
      <CardHeader className="mb-6">
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Sync your documents and access them wherever you go.
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
            Create account
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex-1 border-b border-b-foreground/10 w-full h-0" />
            <span className="text-sm font-normal shrink-0 text-muted-foreground">
              or continue with
            </span>
            <div className="flex-1 border-b border-b-foreground/10 w-full h-0" />
          </div>
          <Button
            type="button"
            disabled={form.formState.isSubmitting}
            variant={"secondary"}
          >
            <Google />
            Continue with Google
          </Button>
          <p className="text-sm font-normal shrink-0 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-foreground">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
