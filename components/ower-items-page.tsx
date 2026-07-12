"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BillContextCard } from "@/components/bill/bill-context-card";
import {
  OwerItemPicker,
  useOwerPreviewTotal,
} from "@/components/ower-item-picker";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { MoneyAmount } from "@/components/bill/money-amount";
import { Button } from "@/components/ui/button";
import { expandBillItems } from "@/lib/bill-units";
import {
  claimsMatchDraft,
  draftToQuantities,
  getOwerClaimDraft,
  hasAnyClaim,
  toClaimPayload,
  validateClaimDraft,
} from "@/lib/claim-units";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { useOwerSession } from "@/lib/use-ower-session";
import type { SplitClaim } from "@/lib/split";

const OWER_STEPS = [
  { label: "Name" },
  { label: "Items" },
  { label: "Summary" },
];

type OwerItemsPageProps = {
  billId: string;
  items: BillItem[];
  totals: BillTotals;
  existingClaims: SplitClaim[];
};

export function OwerItemsPage({
  billId,
  items,
  totals,
  existingClaims,
}: OwerItemsPageProps) {
  const router = useRouter();
  const units = useMemo(() => expandBillItems(items), [items]);
  const { ready, owerName } = useOwerSession(billId);
  const [claimDraft, setClaimDraft] = useState<ReturnType<typeof getOwerClaimDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!ready || !owerName) {
      return;
    }

    setClaimDraft(getOwerClaimDraft(owerName, units, existingClaims));
  }, [existingClaims, owerName, ready, units]);

  const runningTotal = useOwerPreviewTotal(
    items,
    totals,
    owerName ?? "",
    existingClaims,
    claimDraft,
  );

  const hasChanges = useMemo(() => {
    if (!owerName) {
      return false;
    }

    return !claimsMatchDraft(existingClaims, owerName, units, claimDraft);
  }, [claimDraft, existingClaims, owerName, units]);

  const hasSelection = hasAnyClaim(claimDraft);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!owerName) {
      return;
    }

    if (!hasSelection) {
      setError("Select at least one item you owe.");
      return;
    }

    const validationError = validateClaimDraft(
      items,
      existingClaims,
      owerName,
      claimDraft,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasChanges) {
        const response = await fetch(`/api/bills/${billId}/claims`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ower_name: owerName,
            claims: toClaimPayload(draftToQuantities(claimDraft)),
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? "Failed to save your claims. Please try again.");
          return;
        }
      }

      setIsRedirecting(true);
      router.push(`/bill/${billId}/summary`);
    } catch {
      setError("Failed to save your claims. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready || !owerName) {
    return (
      <PageShell centered>
        <LoadingState message="Loading…" />
      </PageShell>
    );
  }

  if (isRedirecting) {
    return (
      <PageShell centered>
        <LoadingState message="Loading summary…" />
      </PageShell>
    );
  }

  return (
    <>
      <PageShell withStickyFooter>
        <AppPageHeader
          title="Claim your items"
          description={`Hi ${owerName} — pick what you had and how you split it.`}
          backHref={`/bill/${billId}/name`}
          backLabel="Change name"
        />

        <StepIndicator steps={OWER_STEPS} currentStep={2} />

        <BillContextCard itemCount={units.length} totals={totals} />

        <form id="ower-claims-form" onSubmit={handleSubmit}>
          <OwerItemPicker
            items={items}
            totals={totals}
            owerName={owerName}
            existingClaims={existingClaims}
            claimDraft={claimDraft}
            onClaimDraftChange={setClaimDraft}
          />

          {error ? (
            <ErrorMessage message={error} className="mt-4" />
          ) : !hasSelection ? (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Select at least one item to continue.
            </p>
          ) : null}
        </form>
      </PageShell>

      <StickyActionBar>
        <div className="flex w-full items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">Your total</p>
            <MoneyAmount amount={runningTotal} size="lg" />
          </div>
          <Button
            type="submit"
            form="ower-claims-form"
            size="lg"
            className="shrink-0 px-6"
            disabled={isSubmitting || !hasSelection}
          >
            {isSubmitting
              ? "Saving…"
              : hasChanges
                ? "Continue"
                : "View summary"}
          </Button>
        </div>
      </StickyActionBar>
    </>
  );
}
