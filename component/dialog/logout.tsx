"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppwriteException } from "appwrite";
import { LogOut, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { DialogProps } from "@/type/component";
import { account } from "@/lib/appwrite/client";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function Logout({ open, onOpenChange }: DialogProps) {
  const mutation = useMutation({
    mutationFn: () =>
      account.deleteSession({
        sessionId: "current",
      }),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "current-user"], null);
      queryClient.removeQueries({
        queryKey: ["auth"],
      });
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await mutation.mutateAsync();
      toast.success("You have been logged out successfully.");

      onOpenChange?.(false);
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Something went wrong while logging out.";

      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            Log out of your account?
          </DialogTitle>
          <DialogDescription>
            You will be signed out of your current session and redirected to the
            home page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleLogout}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
