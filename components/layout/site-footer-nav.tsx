"use client";

import Link from "next/link";

import { usePayerSession } from "@/components/payer-session-provider";

const linkClassName = "hover:text-foreground transition-colors";

export function SiteFooterNav() {
  const { isLoading, isLoggedIn } = usePayerSession();

  return (
    <nav
      aria-label="Site"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
    >
      <Link href="/features" className={linkClassName}>
        How it works
      </Link>
      {!isLoading && !isLoggedIn ? (
        <>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <Link href="/dashboard" className={linkClassName}>
            Sign in
          </Link>
        </>
      ) : null}
    </nav>
  );
}
