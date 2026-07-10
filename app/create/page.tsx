import type { Metadata } from "next";
import Link from "next/link";
import { Camera, PenLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create a bill — Split Bill",
  description: "Add items manually or scan a receipt.",
};

export default function CreatePage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a bill
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Add your items, then share a link so everyone can claim what they
            owe.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/create/manual"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-auto w-full flex-col items-start gap-2 px-4 py-4 text-left",
            )}
          >
            <span className="flex items-center gap-2 text-base font-medium">
              <PenLine className="size-5" />
              Enter items manually
            </span>
            <span className="text-primary-foreground/80 text-sm font-normal">
              Type each line item, tax, and tip
            </span>
          </Link>

          <div
            aria-disabled
            className="border-border bg-muted/40 text-muted-foreground flex w-full flex-col gap-2 rounded-lg border px-4 py-4 opacity-70"
          >
            <span className="flex items-center gap-2 text-base font-medium">
              <Camera className="size-5" />
              Scan a receipt
            </span>
            <span className="text-sm">Coming in a later milestone</span>
          </div>
        </div>
      </main>
    </div>
  );
}
