"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CollectionProgress } from "@/components/bill/collection-progress";
import { ItemProgressBar, progressLabel } from "@/components/bill/item-progress-bar";
import { MoneyAmount } from "@/components/bill/money-amount";
import { StatusBadge } from "@/components/bill/status-badge";
import { BillPasswordPrompt } from "@/components/bill-password-prompt";
import { OptionalSaveAccount } from "@/components/optional-save-account";
import { ShareBillContent } from "@/components/share-bill-content";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import {
  LoadingSkeleton,
  LoadingState,
} from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { StepIndicator } from "@/components/layout/step-indicator";
import { Button } from "@/components/ui/button";
import {
  setStoredBillPassword,
  syncBillPasswordFromHash,
} from "@/lib/bill-password";
import type { BillItem, BillTotals } from "@/lib/database.types";
import type { ItemProgress } from "@/lib/item-progress";
import { buildPayerAuthHeaders } from "@/lib/payer-password";
import { payerViewSignature } from "@/lib/payer-view-signature";
import type { OwerSummary } from "@/lib/split";

type PayerBillPageProps = {
  billId: string;
};

type PayerView = {
  items: BillItem[];
  totals: BillTotals;
  item_progress: ItemProgress[];
  owers: OwerSummary[];
  summary: {
    ower_count: number;
    paid_count: number;
    total_owed: number;
    total_paid: number;
  };
};

const POLL_MS = 30_000;

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

type PayerAccessState =
  | { status: "loading" }
  | { status: "needs_password" }
  | { status: "wrong_password" }
  | { status: "unlocked" }
  | { status: "error" };

type PayerApiError = {
  error?: string;
  password_required?: boolean;
};

export function PayerBillPage({ billId }: PayerBillPageProps) {
  const [view, setView] = useState<PayerView | null>(null);
  const [accessState, setAccessState] = useState<PayerAccessState>({
    status: "loading",
  });
  const [error, setError] = useState<string | null>(null);
  const [markingOwer, setMarkingOwer] = useState<string | null>(null);
  const [confirmingPaidFor, setConfirmingPaidFor] = useState<string | null>(
    null,
  );
  const [isUnlocking, setIsUnlocking] = useState(false);
  const isUnlockedRef = useRef(false);
  const viewSignatureRef = useRef("");

  useEffect(() => {
    isUnlockedRef.current = accessState.status === "unlocked";
  }, [accessState.status]);

  const fetchView = useCallback(async () => {
    const authHeaders = await buildPayerAuthHeaders(billId);
    const response = await fetch(`/api/bills/${billId}/payer`, {
      headers: authHeaders,
    });
    const data = (await response.json()) as PayerView & PayerApiError;

    if (response.status === 401 && data.password_required) {
      return { ok: false as const, needsPassword: true };
    }

    if (!response.ok) {
      return {
        ok: false as const,
        needsPassword: false,
        error: data.error ?? "Failed to load bill.",
      };
    }

    return { ok: true as const, data };
  }, [billId]);

  const applyView = useCallback((data: PayerView, options?: { silent?: boolean }) => {
    const signature = payerViewSignature(data);

    if (options?.silent && signature === viewSignatureRef.current) {
      return;
    }

    viewSignatureRef.current = signature;
    setView(data);
    setAccessState({ status: "unlocked" });
    setError(null);
  }, []);

  const loadView = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        const result = await fetchView();

        if (!result.ok) {
          if (result.needsPassword) {
            setAccessState({ status: "needs_password" });
            setView(null);
            setError(null);
            return;
          }

          setError(result.error ?? "Failed to load bill.");
          setAccessState({ status: "error" });
          return;
        }

        applyView(result.data, options);
      } catch {
        setError("Failed to load bill.");
        setAccessState({ status: "error" });
      }
    },
    [applyView, fetchView],
  );

  const loadViewRef = useRef(loadView);
  loadViewRef.current = loadView;

  useEffect(() => {
    syncBillPasswordFromHash(billId);

    async function initialLoad() {
      await loadViewRef.current();
    }

    void initialLoad();

    const intervalId = window.setInterval(() => {
      if (
        !isUnlockedRef.current ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      void loadViewRef.current({ silent: true });
    }, POLL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && isUnlockedRef.current) {
        void loadViewRef.current({ silent: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [billId]);

  async function handleUnlock(password: string) {
    setIsUnlocking(true);
    setStoredBillPassword(billId, password);

    try {
      const result = await fetchView();

      if (!result.ok) {
        if (result.needsPassword) {
          setAccessState({ status: "wrong_password" });
          return;
        }

        setError(result.error ?? "Failed to load bill.");
        return;
      }

      setView(result.data);
      viewSignatureRef.current = payerViewSignature(result.data);
      setAccessState({ status: "unlocked" });
      setError(null);
    } catch {
      setError("Failed to load bill.");
    } finally {
      setIsUnlocking(false);
    }
  }

  async function handleMarkPaid(owerName: string) {
    setMarkingOwer(owerName);
    setConfirmingPaidFor(null);

    try {
      const authHeaders = await buildPayerAuthHeaders(billId);
      const response = await fetch(`/api/bills/${billId}/paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ ower_name: owerName }),
      });

      if (response.status === 401) {
        setAccessState({ status: "needs_password" });
        setView(null);
        return;
      }

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to mark as paid.");
        return;
      }

      await loadView();
    } catch {
      setError("Failed to mark as paid.");
    } finally {
      setMarkingOwer(null);
    }
  }

  const isLoading = accessState.status === "loading";
  const needsPassword =
    accessState.status === "needs_password" ||
    accessState.status === "wrong_password";
  const isUnlocked = accessState.status === "unlocked" && view;

  return (
    <PageShell wide>
      <PageHeader
        title="Your bill"
        description="Track who has claimed items and who has paid you back."
        backHref="/"
        backLabel="Home"
      />

      <StepIndicator steps={PAYER_STEPS} currentStep={3} />

      {isLoading ? (
        <LoadingSkeleton />
      ) : needsPassword ? (
        <BillPasswordPrompt
          title="Unlock your dashboard"
          description="Enter the password you chose when adding payment details. It's also the part after # in your link."
          label="Bill password"
          onSubmit={(password) => void handleUnlock(password)}
          error={
            accessState.status === "wrong_password"
              ? "Incorrect password. Try again."
              : null
          }
          isSubmitting={isUnlocking}
        />
      ) : error && !view ? (
        <ErrorMessage message={error} centered />
      ) : isUnlocked ? (
        <div className="space-y-6">
          <ShareBillContent billId={billId} />

          {error ? <ErrorMessage message={error} /> : null}

          <SectionCard title="Collection" aria-live="polite" aria-atomic="true">
            <CollectionProgress
              paid={view.summary.total_paid}
              owed={view.summary.total_owed}
              paidCount={view.summary.paid_count}
              owerCount={view.summary.ower_count}
            />
          </SectionCard>

          <div className="space-y-3">
            <h2 className="text-sm font-medium">Items</h2>
            <ul className="space-y-3">
              {view.item_progress.map((progress) => (
                <li key={progress.item_id}>
                  <SectionCard className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {progress.item_name}
                        </p>
                        <MoneyAmount
                          amount={progress.item_cost}
                          size="sm"
                          className="text-muted-foreground"
                        />
                      </div>
                      <StatusBadge
                        status={
                          progress.status === "settled"
                            ? "settled"
                            : progress.status === "unclaimed"
                              ? "unclaimed"
                              : "pending"
                        }
                      />
                    </div>

                    <ItemProgressBar progress={progress} />
                    <p className="text-muted-foreground text-xs">
                      {progressLabel(progress)}
                    </p>

                    {progress.claimants.length > 0 ? (
                      <ul className="text-muted-foreground space-y-1 text-xs">
                        {progress.claimants.map((claimant) => (
                          <li
                            key={claimant.ower_name}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="truncate">{claimant.ower_name}</span>
                            <StatusBadge
                              status={claimant.paid ? "paid" : "pending"}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        Waiting for someone to claim this item.
                      </p>
                    )}
                  </SectionCard>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium">Who owes you</h2>
            {view.owers.length === 0 ? (
              <EmptyState
                title="No claims yet"
                description="Share the link so people can pick what they owe."
              />
            ) : (
              <ul className="space-y-2">
                {view.owers.map((ower) => (
                  <li key={ower.ower_name}>
                    <SectionCard
                      highlight={Boolean(ower.paid_at)}
                      className="flex items-center justify-between gap-3 !space-y-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{ower.ower_name}</p>
                        <MoneyAmount
                          amount={ower.total}
                          size="sm"
                          className="text-muted-foreground"
                        />
                      </div>

                      {ower.paid_at ? (
                        <span className="text-success inline-flex shrink-0 items-center gap-1 text-sm font-medium">
                          <Check className="size-4" />
                          Paid
                        </span>
                      ) : confirmingPaidFor === ower.ower_name ? (
                        <div className="flex shrink-0 gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            disabled={markingOwer === ower.ower_name}
                            onClick={() => void handleMarkPaid(ower.ower_name)}
                          >
                            {markingOwer === ower.ower_name
                              ? "Saving…"
                              : "Confirm"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={markingOwer === ower.ower_name}
                            onClick={() => setConfirmingPaidFor(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => setConfirmingPaidFor(ower.ower_name)}
                        >
                          Mark paid
                        </Button>
                      )}
                    </SectionCard>
                  </li>
                ))}
              </ul>
            )}
            {view.owers.length > 0 ? (
              <p className="text-muted-foreground text-xs">
                People can also tap &ldquo;I&apos;ve paid&rdquo; on their summary.
                Updates every 30 seconds while this tab is open.
              </p>
            ) : null}
          </div>

          <SectionCard title="Bill totals" className="text-sm">
            <dl className="text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <dt>Bill total</dt>
                <dd>
                  <MoneyAmount amount={view.totals.total} size="sm" />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>
                  <MoneyAmount amount={view.totals.tax} size="sm" />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Tip</dt>
                <dd>
                  <MoneyAmount amount={view.totals.tip} size="sm" />
                </dd>
              </div>
            </dl>
          </SectionCard>

          <OptionalSaveAccount billId={billId} />
        </div>
      ) : (
        <LoadingState message="Loading your bill…" />
      )}
    </PageShell>
  );
}
