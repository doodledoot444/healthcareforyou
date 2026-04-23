"use client";

import { useEffect, useTransition } from "react";
import { signOut } from "next-auth/react";
import { logoutUser, onCrossTabLogout } from "@/features/auth/client";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return onCrossTabLogout(() => {
      void signOut({ callbackUrl: "/", redirect: true });
    });
  }, []);

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void logoutUser("/"))}
      className={className}
      disabled={isPending}
      aria-label="Log out"
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
