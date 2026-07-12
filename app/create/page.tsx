import type { Metadata } from "next";
import Link from "next/link";
import { Camera, PenLine } from "lucide-react";

import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StepIndicator } from "@/components/layout/step-indicator";
import { SectionCard } from "@/components/layout/section-card";
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
            "shadow-card h-auto w-full flex-col items-start gap-2 px-5 py-5 text-left",
          )}
        >
          <span className="flex items-center gap-2.5 text-base font-medium">
            <PenLine className="size-5" aria-hidden />
            Enter items manually
          </span>
          <span className="text-primary-foreground/80 text-sm font-normal">
            Type each line item, tax, and tip
          </span>
        </Link>

        <SectionCard className="opacity-75">
          <div className="flex items-start gap-3">
            <Camera
              className="text-muted-foreground mt-0.5 size-5 shrink-0"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="font-medium">Scan a receipt</p>
              <p className="text-muted-foreground text-sm">
                Snap a photo and we&apos;ll fill in the items — coming soon.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
