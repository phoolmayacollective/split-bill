"use client";

import Link from "next/link";
import { Camera, PenLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePageActions() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 self-stretch">
      <Link
        href="/create/manual"
        className={cn(
          buttonVariants({ size: "lg" }),
          "shadow-card h-auto w-full min-w-0 flex-col items-start gap-2 whitespace-normal px-5 py-5 text-left",
        )}
      >
        <span className="flex items-center gap-2.5 text-base font-medium">
          <PenLine className="size-5" aria-hidden />
          Create a bill
        </span>
        <span className="text-primary-foreground/80 w-full text-sm leading-snug font-normal text-pretty">
          Type each line item, tax, and tip
        </span>
      </Link>

      <Link
        href="/create/scan"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "h-auto w-full min-w-0 flex-col items-start gap-2 whitespace-normal px-5 py-5 text-left",
        )}
      >
        <span className="flex items-center gap-2.5 text-base font-medium">
          <Camera className="size-5" aria-hidden />
          Scan a receipt
        </span>
        <span className="text-muted-foreground w-full text-sm leading-snug font-normal text-pretty">
          Photo or upload a receipt, then review and edit line items
        </span>
      </Link>
    </div>
  );
}
