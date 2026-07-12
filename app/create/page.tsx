import type { Metadata } from "next";
import Link from "next/link";
import { Camera, PenLine } from "lucide-react";

import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StepIndicator } from "@/components/layout/step-indicator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create a bill — Split Bill",
  description: "Add items manually or scan a receipt.",
};

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

export default function CreatePage() {
  return (
    <PageShell>
      <AppPageHeader
        title="Create a bill"
        description="Add your items, set up payment, then share the link."
      />

      <StepIndicator steps={PAYER_STEPS} currentStep={1} />

      <div className="flex flex-col gap-3">
        <Link
          href="/create/manual"
          className={cn(
            buttonVariants({ size: "lg" }),
            "shadow-card h-auto w-full min-w-0 flex-col items-start gap-2 whitespace-normal px-5 py-5 text-left",
          )}
        >
          <span className="flex items-center gap-2.5 text-base font-medium">
            <PenLine className="size-5" aria-hidden />
            Enter items manually
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
    </PageShell>
  );
}
