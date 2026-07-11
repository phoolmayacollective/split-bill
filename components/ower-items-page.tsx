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
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { MoneyAmount } from "@/components/bill/money-amount";
import { Button } from "@/components/ui/button";
import {
  claimsMatchQuantities,
  getOwerClaimQuantities,
  hasAnyClaim,
  toClaimPayload,
  validateClaimQuantities,
} from "@/lib/claim-units";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { getOwerName } from "@/lib/ower-session";
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
  const owerName = useMemo(() => getOwerName(billId), [billId]);
  const [claimQuantities, setClaimQuantities] = useState(() => {
    const name = getOwerName(billId);
    return name ? getOwerClaimQuantities(name, existingClaims) : {};
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!owerName) {
      router.replace(`/bill/${billId}/name`);
    }
  }, [billId, owerName, router]);

  const runningTotal = useOwerPreviewTotal(
    items,
    totals,
    owerName ?? "",
    existingClaims,
    claimQuantities,
  );

  const hasChanges = useMemo(() => {
    if (!owerName) {
      return false;
    }

    return !claimsMatchQuantities(existingClaims, owerName, claimQuantities);
  }, [claimQuantities, existingClaims, owerName]);

  const hasSelection = hasAnyClaim(claimQuantities);

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

    const validationError = validateClaimQuantities(
      items,
      existingClaims,
      owerName,
      claimQuantities,
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
            claims: toClaimPayload(claimQuantities),
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

  if (!owerName) {
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
        <PageHeader
          title="Claim your items"
          description={`Hi ${owerName} — check everything you're paying for.`}
          backHref={`/bill/${billId}/name`}
          backLabel="Change name"
        />

        <StepIndicator steps={OWER_STEPS} currentStep={2} />

        <BillContextCard itemCount={items.length} totals={totals} />

        <form id="ower-claims-form" onSubmit={handleSubmit}>
          <OwerItemPicker
            items={items}
            totals={totals}
            owerName={owerName}
            existingClaims={existingClaims}
            claimQuantities={claimQuantities}
            onClaimQuantitiesChange={setClaimQuantities}
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
