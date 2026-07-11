"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Wallet } from "lucide-react";

import { MoneyAmount } from "@/components/bill/money-amount";
import { MoneyBreakdown } from "@/components/bill/money-breakdown";
import { BillPasswordPrompt } from "@/components/bill-password-prompt";
import { CopyField } from "@/components/feedback/copy-field";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PublicBill } from "@/lib/api/bills";
import {
  getStoredBillPassword,
  setStoredBillPassword,
  syncBillPasswordFromHash,
} from "@/lib/bill-password";
import { formatMoney } from "@/lib/bill-totals";
import {
  decryptPaymentDetails,
  type PaymentDetails,
} from "@/lib/crypto";
import { getOwerName } from "@/lib/ower-session";
import { buildPayerAuthHeaders } from "@/lib/payer-password";
import type { OwerSummary } from "@/lib/split";
import { cn } from "@/lib/utils";

const OWER_STEPS = [
  { label: "Name" },
  { label: "Items" },
  { label: "Summary" },
];

type OwerSummaryPageProps = {
  billId: string;
};

type PaymentState =
  | { status: "idle" }
  | { status: "no_payment" }
  | { status: "needs_password" }
  | { status: "decrypting" }
  | { status: "wrong_password" }
  | { status: "ready"; details: PaymentDetails };

type EncryptedPaymentPayload = {
  payment_enc: string;
  payment_iv: string;
  payment_salt: string;
  kdf_iterations: number;
};

function hasEncryptedPayment(
  bill: PublicBill | null,
): bill is PublicBill & EncryptedPaymentPayload {
  return Boolean(
    bill?.payment_enc &&
      bill.payment_iv &&
      bill.payment_salt &&
      bill.kdf_iterations,
  );
}

export function OwerSummaryPage({ billId }: OwerSummaryPageProps) {
  const router = useRouter();
  const owerName = useMemo(() => getOwerName(billId), [billId]);
  const [summary, setSummary] = useState<OwerSummary | null>(null);
  const [encryptedBill, setEncryptedBill] = useState<PublicBill | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: "idle",
  });
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [paidError, setPaidError] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const tryDecrypt = useCallback(
    async (password: string, bill: PublicBill & EncryptedPaymentPayload) => {
      setIsDecrypting(true);
      setPaymentState({ status: "decrypting" });

      try {
        const details = await decryptPaymentDetails(
          password,
          bill.payment_enc,
          bill.payment_iv,
          bill.payment_salt,
          bill.kdf_iterations,
        );
        setStoredBillPassword(billId, password);
        setPaymentState({ status: "ready", details });
      } catch {
        setPaymentState({ status: "wrong_password" });
      } finally {
        setIsDecrypting(false);
      }
    },
    [billId],
  );

  useEffect(() => {
    if (!owerName) {
      router.replace(`/bill/${billId}/name`);
      return;
    }

    async function loadData() {
      try {
        const [summaryResponse, billResponse] = await Promise.all([
          fetch(`/api/bills/${billId}/summary`),
          fetch(`/api/bills/${billId}`),
        ]);

        const summaryData = (await summaryResponse.json()) as {
          owers?: OwerSummary[];
          error?: string;
        };
        const billData = (await billResponse.json()) as PublicBill & {
          error?: string;
        };

        if (!summaryResponse.ok) {
          setSummaryError(summaryData.error ?? "Failed to load your summary.");
          return;
        }

        const owerSummary =
          summaryData.owers?.find((entry) => entry.ower_name === owerName) ??
          null;

        if (!owerSummary) {
          setSummaryError(
            "No claims found for your name. Go back and select your items.",
          );
          return;
        }

        setSummary(owerSummary);

        if (!billResponse.ok) {
          setPaymentState({ status: "no_payment" });
          return;
        }

        setEncryptedBill(billData);

        if (!hasEncryptedPayment(billData)) {
          setPaymentState({ status: "no_payment" });
          return;
        }

        const password =
          syncBillPasswordFromHash(billId) ?? getStoredBillPassword(billId);

        if (!password) {
          setPaymentState({ status: "needs_password" });
          return;
        }

        await tryDecrypt(password, billData);
      } catch {
        setSummaryError("Failed to load your summary.");
      } finally {
        setIsLoadingSummary(false);
      }
    }

    void loadData();
  }, [billId, owerName, router, tryDecrypt]);

  function handlePasswordSubmit(password: string) {
    if (!hasEncryptedPayment(encryptedBill)) {
      return;
    }

    void tryDecrypt(password, encryptedBill);
  }

  async function handleMarkPaid() {
    if (!owerName || !summary || summary.paid_at) {
      return;
    }

    setPaidError(null);
    setIsMarkingPaid(true);

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

      const data = (await response.json()) as {
        ower?: OwerSummary;
        error?: string;
      };

      if (!response.ok || !data.ower) {
        setPaidError(data.error ?? "Failed to mark as paid. Please try again.");
        return;
      }

      setSummary(data.ower);
    } catch {
      setPaidError("Failed to mark as paid. Please try again.");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  const showStickyPaid = Boolean(summary && !summary.paid_at);

  if (!owerName) {
    return (
      <PageShell centered>
        <LoadingState message="Loading…" />
      </PageShell>
    );
  }

  return (
    <>
      <PageShell centered withStickyFooter={showStickyPaid}>
        <PageHeader
          title={
            summary ? `You owe ${formatMoney(summary.total)}` : "Your summary"
          }
          description={
            summary
              ? `${owerName}, here's your share of the bill.`
              : "Loading your total…"
          }
          icon={
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
              <Wallet className="size-7" aria-hidden />
            </div>
          }
          centered
        />

        <StepIndicator steps={OWER_STEPS} currentStep={3} />

        {isLoadingSummary ? (
          <LoadingState message="Loading your summary…" />
        ) : summaryError ? (
          <div className="space-y-4">
            <ErrorMessage message={summaryError} centered />
            <Link
              href={`/bill/${billId}/items`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Back to items
            </Link>
          </div>
        ) : summary ? (
          <div className="w-full space-y-6">
            <SectionCard highlight className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Amount to pay</p>
                <MoneyAmount
                  amount={summary.total}
                  size="hero"
                  className="text-primary"
                />
              </div>

              {paymentState.status === "decrypting" ? (
                <LoadingState message="Unlocking payment details…" />
              ) : paymentState.status === "ready" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center text-sm">
                    Send {formatMoney(summary.total)} using the details below.
                  </p>

                  {paymentState.details.paypal ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        PayPal
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 break-all font-mono text-sm">
                          {paymentState.details.paypal}
                        </p>
                        <CopyField
                          value={paymentState.details.paypal}
                          label="PayPal"
                          variant="button"
                        />
                      </div>
                    </div>
                  ) : null}

                  {paymentState.details.iban ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        IBAN
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 break-all font-mono text-sm">
                          {paymentState.details.iban}
                        </p>
                        <CopyField
                          value={paymentState.details.iban}
                          label="IBAN"
                          variant="button"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : paymentState.status === "needs_password" ||
                paymentState.status === "wrong_password" ? (
                <BillPasswordPrompt
                  onSubmit={handlePasswordSubmit}
                  error={
                    paymentState.status === "wrong_password"
                      ? "Wrong password — check the full share link or try again."
                      : null
                  }
                  isSubmitting={isDecrypting}
                />
              ) : paymentState.status === "no_payment" ? (
                <p className="text-muted-foreground text-center text-sm">
                  The payer hasn&apos;t added payment details yet.
                </p>
              ) : null}
            </SectionCard>

            {summary.lines.length > 0 ? (
              <SectionCard title="Your items">
                <ul className="space-y-2 text-sm">
                  {summary.lines.map((line) => (
                    <li
                      key={line.item_id}
                      className="flex justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="block truncate">{line.item_name}</span>
                        {line.split_label ? (
                          <span className="text-muted-foreground text-xs">
                            {line.split_label}
                          </span>
                        ) : null}
                      </div>
                      <MoneyAmount amount={line.amount} size="sm" />
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ) : null}

            <SectionCard title="Breakdown">
              <MoneyBreakdown
                lines={[
                  { label: "Subtotal", amount: summary.subtotal },
                  ...(summary.tax_share > 0
                    ? [{ label: "Tax share", amount: summary.tax_share }]
                    : []),
                  ...(summary.tip_share > 0
                    ? [{ label: "Tip share", amount: summary.tip_share }]
                    : []),
                ]}
                total={summary.total}
              />
            </SectionCard>

            {summary.paid_at ? (
              <div className="bg-success/10 border-success/30 text-success flex items-center justify-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium">
                <Check className="size-4" />
                Marked as paid — the payer has been notified.
              </div>
            ) : paidError ? (
              <ErrorMessage message={paidError} centered />
            ) : null}

            <Link
              href={`/bill/${billId}/items`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Edit my items
            </Link>
          </div>
        ) : null}
      </PageShell>

      {showStickyPaid && summary ? (
        <StickyActionBar>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isMarkingPaid}
            onClick={() => void handleMarkPaid()}
          >
            {isMarkingPaid ? "Saving…" : "I've paid"}
          </Button>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Tap after you send {formatMoney(summary.total)}
          </p>
        </StickyActionBar>
      ) : null}
    </>
  );
}
