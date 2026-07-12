"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePageActions() {
  return (
    <Link
      href="/create/manual"
      className={cn(buttonVariants({ size: "lg" }), "shadow-card w-full")}
    >
      Create a bill
    </Link>
  );
}
