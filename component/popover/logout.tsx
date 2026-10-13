"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppwriteException } from "appwrite";
import { LogOut, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import type { ClassOnlyProps } from "@/type/component";
import { account } from "@/lib/appwrite/client";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function Logout({ className }: ClassOnlyProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await account.deleteSession({
        sessionId: "current",
      });

      queryClient.setQueryData(["auth", "current-user"], null);
      queryClient.removeQueries({
        queryKey: ["auth"],
      });

      toast.success("You have been logged out successfully.");

      setOpen(false);

      router.replace("/");
    } catch (error) {
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Something went wrong while logging out.";

      toast.error("Logout failed", {
        description: message,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <DropdownMenuItem
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className={className}
            disabled={isLoggingOut}
            variant="destructive"
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        }
      />
      <PopoverContent align="end" sideOffset={10} className="w-80">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            Log out of your account?
          </PopoverTitle>

          <PopoverDescription>
            You will be signed out of your current session and redirected to the
            login page.
          </PopoverDescription>
        </PopoverHeader>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoggingOut}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                Log out
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
