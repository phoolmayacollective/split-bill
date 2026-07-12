"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { usePayerSession } from "@/components/payer-session-provider";
import { Button } from "@/components/ui/button";

type PayerHeaderTrailingProps = {
  showSignOut?: boolean;
};

export function PayerHeaderTrailing({
  showSignOut = false,
}: PayerHeaderTrailingProps) {
  const { payer, isLoading, isLoggedIn, clear } = usePayerSession();

  if (isLoading || !isLoggedIn || !payer) {
    return null;
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
