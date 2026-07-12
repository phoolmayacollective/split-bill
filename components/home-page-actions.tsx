"use client";

import Link from "next/link";

import { usePayerSession } from "@/components/payer-session-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePageActions() {
  const { isLoggedIn, isLoading } = usePayerSession();

  return (
    <div className="flex w-full flex-col gap-3">
      <Link
        href="/create/manual"
        className={cn(buttonVariants({ size: "lg" }), "shadow-card w-full")}
      >
        Create a bill
      </Link>
      {!isLoading && !isLoggedIn ? (
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full",
          )}
        >
          Sign in
        </Link>
      ) : null}
      {!isLoading && isLoggedIn ? (
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full",
          )}
        >
          Your bills
        </Link>
      ) : null}
    </div>
  );
}
