"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";

import { usePayerSession } from "@/components/payer-session-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PayerHeaderTrailingProps = {
  showSignOut?: boolean;
  /** Subtle sign-in affordance when signed out */
  showSignIn?: boolean;
};

export function PayerHeaderTrailing({
  showSignOut = false,
  showSignIn = false,
}: PayerHeaderTrailingProps) {
  const { payer, isLoading, isLoggedIn, clear } = usePayerSession();

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn || !payer) {
    if (!showSignIn) {
      return null;
    }

    return (
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink")}
      >
        <LogIn />
        Sign in
      </Link>
    );
  }

  async function handleLogout() {
    await fetch("/api/payer/logout", { method: "POST" });
    clear();
  }

  if (showSignOut) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleLogout()}
      >
        <LogOut />
        Sign out
      </Button>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="text-muted-foreground hover:text-foreground shrink-0 text-sm font-medium transition-colors"
    >
      {payer.username}
    </Link>
  );
}
