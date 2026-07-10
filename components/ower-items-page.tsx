"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  OwerItemPicker,
  useOwerPreviewTotal,
} from "@/components/ower-item-picker";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/bill-totals";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { getOwerName } from "@/lib/ower-session";
import type { SplitClaim } from "@/lib/split";

type OwerItemsPageProps = {
  billId: string;
  items: BillItem[];
  totals: BillTotals;
  existingClaims: SplitClaim[];
};

function getInitialSelection(
  owerName: string,
  existingClaims: SplitClaim[],
): Set<string> {
  return new Set(
    existingClaims
      .filter((claim) => claim.ower_name === owerName)
      .map((claim) => claim.item_id),
  );
}

function getNewClaims(
  owerName: string,
  existingClaims: SplitClaim[],
  selectedIds: Set<string>,
): Array<{ item_id: string; share: number }> {
  const alreadyClaimed = new Set(
    existingClaims
      .filter((claim) => claim.ower_name === owerName)
      .map((claim) => claim.item_id),
  );

  return [...selectedIds]
    .filter((itemId) => !alreadyClaimed.has(itemId))
    .map((item_id) => ({ item_id, share: 1 }));
}

export function OwerItemsPage({
  billId,
  items,
  totals,
  existingClaims,
}: OwerItemsPageProps) {
  const router = useRouter();
  const owerName = useMemo(() => getOwerName(billId), [billId]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const name = getOwerName(billId);
    return name ? getInitialSelection(name, existingClaims) : new Set<string>();
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    selectedIds,
  );

  const hasNewClaims = useMemo(() => {
    if (!owerName) {
      return false;
    }

    return getNewClaims(owerName, existingClaims, selectedIds).length > 0;
  }, [existingClaims, owerName, selectedIds]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!owerName) {
      return;
    }

    if (selectedIds.size === 0) {
      setError("Select at least one item you owe.");
      return;
    }

    const newClaims = getNewClaims(owerName, existingClaims, selectedIds);

    setIsSubmitting(true);

    try {
      if (newClaims.length > 0) {
        const response = await fetch(`/api/bills/${billId}/claims`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ower_name: owerName,
            claims: newClaims,
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? "Failed to save your claims. Please try again.");
          return;
        }
      }

      router.push(`/bill/${billId}/summary`);
    } catch {
      setError("Failed to save your claims. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!owerName) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 pb-28">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="space-y-2">
          <Link
            href={`/bill/${billId}/name`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Change name
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Claim your items
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Hi {owerName} — check everything you&apos;re paying for.
          </p>
        </div>

        <form id="ower-claims-form" onSubmit={handleSubmit}>
          <OwerItemPicker
            items={items}
            totals={totals}
            owerName={owerName}
            existingClaims={existingClaims}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {error ? (
            <p className="text-destructive mt-4 text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </main>

      <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 border-t p-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">Your total</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMoney(runningTotal)}
            </p>
          </div>
          <Button
            type="submit"
            form="ower-claims-form"
            size="lg"
            className="h-11 shrink-0 px-6"
            disabled={isSubmitting || selectedIds.size === 0}
          >
            {isSubmitting
              ? "Saving…"
              : hasNewClaims
                ? "Continue"
                : "View summary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
