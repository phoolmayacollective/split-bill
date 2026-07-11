"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, RefreshCw } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encryptPaymentDetails } from "@/lib/crypto";
import { hashPayerViewPassword } from "@/lib/payer-password";
import { generateSharePassword } from "@/lib/share-password";

type PaymentFormProps = {
  billId: string;
};

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

function hasPaymentDetails(paypal: string, iban: string): boolean {
  return paypal.trim().length > 0 || iban.trim().length > 0;
}

export function PaymentForm({ billId }: PaymentFormProps) {
  const router = useRouter();
  const [paypal, setPaypal] = useState("");
  const [iban, setIban] = useState("");
  const [password, setPassword] = useState(() => generateSharePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedPaypal = paypal.trim();
    const trimmedIban = iban.trim();
    const trimmedPassword = password.trim();

    if (!hasPaymentDetails(trimmedPaypal, trimmedIban)) {
      setError(
        "Add a PayPal email, username, or paypal.me link — or an IBAN — so owers know how to pay you.",
      );
      return;
    }

    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const encrypted = await encryptPaymentDetails(trimmedPassword, {
        ...(trimmedPaypal ? { paypal: trimmedPaypal } : {}),
        ...(trimmedIban ? { iban: trimmedIban } : {}),
      });
      const payerPasswordHash = await hashPayerViewPassword(
        trimmedPassword,
        billId,
      );

      const response = await fetch(`/api/bills/${billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...encrypted,
          payer_password_hash: payerPasswordHash,
        }),
      });

      const data = (await response.json()) as {
        billId?: string;
        error?: string;
      };

      if (!response.ok || !data.billId) {
        setError(data.error ?? "Failed to save payment details. Please try again.");
        return;
      }

      router.push(
        `/bill/${billId}/payer#${encodeURIComponent(trimmedPassword)}`,
      );
    } catch {
      setError("Failed to save payment details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageShell withStickyFooter>
        <PageHeader
          title="Payment details"
          description="Add how owers should pay you. Details are encrypted in your browser before anything is saved."
          backHref="/create"
          backLabel="Back to create"
        />

        <StepIndicator steps={PAYER_STEPS} currentStep={2} />

        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            title="How to pay you"
            description="Add at least one — PayPal or IBAN."
          >
            <div className="space-y-2">
              <Label htmlFor="payment-paypal">PayPal</Label>
              <Input
                id="payment-paypal"
                type="text"
                autoComplete="off"
                placeholder="you@example.com, @username, or paypal.me/you"
                value={paypal}
                onChange={(event) => setPaypal(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-iban">IBAN</Label>
              <Input
                id="payment-iban"
                type="text"
                autoComplete="off"
                placeholder="DE89 3704 0044 0532 0130 00"
                value={iban}
                onChange={(event) => setIban(event.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Link password"
            description="One password unlocks your dashboard and lets owers see how to pay you. It's added to the share link automatically."
          >
            <div className="flex gap-2">
              <Input
                id="payment-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                className="size-11 shrink-0"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="size-11 shrink-0"
                onClick={() => setPassword(generateSharePassword())}
                aria-label="Generate new password"
              >
                <RefreshCw />
              </Button>
            </div>
            <p className="text-muted-foreground flex items-start gap-2 text-sm">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              Encrypted in your browser. The server never sees your PayPal, IBAN,
              or password.
            </p>
          </SectionCard>

          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </PageShell>

      <StickyActionBar>
        <Button
          type="submit"
          form="payment-form"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Encrypting…" : "Save & open dashboard"}
        </Button>
      </StickyActionBar>
    </>
  );
}
