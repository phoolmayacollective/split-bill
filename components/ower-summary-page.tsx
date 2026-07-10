"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { formatMoney } from "@/lib/bill-totals";
import { cn } from "@/lib/utils";
import { getOwerName } from "@/lib/ower-session";
import type { OwerSplitResult } from "@/lib/split";

type OwerSummaryPageProps = {
  billId: string;
};

export function OwerSummaryPage({ billId }: OwerSummaryPageProps) {
  const router = useRouter();
  const owerName = useMemo(() => getOwerName(billId), [billId]);
  const [summary, setSummary] = useState<OwerSplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!owerName) {
      router.replace(`/bill/${billId}/name`);
      return;
    }

    async function loadSummary() {
      try {
        const response = await fetch(`/api/bills/${billId}/summary`);
        const data = (await response.json()) as {
          owers?: OwerSplitResult[];
          error?: string;
        };

        if (!response.ok) {
          setError(data.error ?? "Failed to load your summary.");
          return;
        }

        const owerSummary =
          data.owers?.find((entry) => entry.ower_name === owerName) ?? null;

        if (!owerSummary) {
          setError("No claims found for your name. Go back and select your items.");
          return;
        }

        setSummary(owerSummary);
      } catch {
        setError("Failed to load your summary.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSummary();
  }, [billId, owerName, router]);

  if (!owerName) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full text-xl">
            $
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            You owe {summary ? formatMoney(summary.total) : "…"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {owerName}, here&apos;s your share of the bill.
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center text-sm">Loading…</p>
        ) : error ? (
          <div className="space-y-4 text-center">
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
            <Link
              href={`/bill/${billId}/items`}
              className={cn(buttonVariants({ variant: "outline" }), "h-10")}
            >
              Back to items
            </Link>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {summary.lines.length > 0 ? (
              <div className="bg-card space-y-3 rounded-xl border p-4">
                <h2 className="font-medium">Your items</h2>
                <ul className="space-y-2 text-sm">
                  {summary.lines.map((line) => (
                    <li
                      key={line.item_id}
                      className="flex justify-between gap-3"
                    >
                      <span className="min-w-0 truncate">{line.item_name}</span>
                      <span className="shrink-0 tabular-nums">
                        {formatMoney(line.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-card space-y-3 rounded-xl border p-4">
              <h2 className="font-medium">Breakdown</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(summary.subtotal)}
                  </dd>
                </div>
                {summary.tax_share > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tax share</dt>
                    <dd className="font-medium tabular-nums">
                      {formatMoney(summary.tax_share)}
                    </dd>
                  </div>
                ) : null}
                {summary.tip_share > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tip share</dt>
                    <dd className="font-medium tabular-nums">
                      {formatMoney(summary.tip_share)}
                    </dd>
                  </div>
                ) : null}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base">
                    <dt className="font-medium">Total</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatMoney(summary.total)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <p className="text-muted-foreground text-center text-sm">
              Payment details will be available in a future update.
            </p>

            <Link
              href={`/bill/${billId}/items`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full",
              )}
            >
              Edit my items
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
