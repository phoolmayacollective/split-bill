"use client";

import { useState } from "react";
import { useSyncExternalStore } from "react";
import { KeyRound, Link2, Shield } from "lucide-react";

import { CopyField } from "@/components/feedback/copy-field";
import { SectionCard } from "@/components/layout/section-card";
import { ShareQrCode } from "@/components/share-qr-code";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { readPasswordFromHash } from "@/lib/bill-password";
import { getBillShareUrl } from "@/lib/share-url";

type ShareBillContentProps = {
  billId: string;
};

function subscribeToHashChange(onStoreChange: () => void): () => void {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function useUrlPassword(): string {
  return useSyncExternalStore(
    subscribeToHashChange,
    readPasswordFromHash,
    () => "",
  );
}

export function ShareBillContent({ billId }: ShareBillContentProps) {
  const password = useUrlPassword();
  const hasPassword = password.length > 0;
  const [separatePassword, setSeparatePassword] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const shareUrl = getBillShareUrl(billId, {
    password:
      hasPassword && !separatePassword ? password : undefined,
    origin,
  });

  const showSeparatePasswordFields = separatePassword && hasPassword;

  return (
    <SectionCard
      title="Share with friends"
      description="Friends open this link to claim what they owe. Your dashboard stays at /payer."
    >
      {hasPassword ? (
        <label className="border-border bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <Checkbox
            id="separate-password"
            checked={separatePassword}
            onCheckedChange={setSeparatePassword}
            className="mt-0.5"
          />
          <span className="space-y-0.5">
            <Label
              htmlFor="separate-password"
              className="cursor-pointer text-sm font-medium"
            >
              Send password separately
            </Label>
            <span className="text-muted-foreground block text-sm">
              Share the link in one message and the password in another — safer if
              the link might be forwarded.
            </span>
          </span>
        </label>
      ) : null}

      <div className="space-y-2">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
          <Link2 className="size-3.5" aria-hidden />
          Ower link
        </p>
        <CopyField value={shareUrl} label="Share link" allowShare />
      </div>

      {showSeparatePasswordFields ? (
        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
            <KeyRound className="size-3.5" aria-hidden />
            Password
          </p>
          <CopyField value={password} label="Bill password" />
        </div>
      ) : null}

      <ShareQrCode value={shareUrl} />

      {hasPassword ? (
        separatePassword ? (
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <Shield className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            Send the link and password separately. Friends enter the password when
            they open the bill.
          </p>
        ) : (
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <Shield className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            This link includes your password. Only share with people who need to
            pay you.
          </p>
        )
      ) : (
        <p className="text-muted-foreground text-sm">
          Open the link from when you saved payment details — it includes the{" "}
          <span className="font-mono text-xs">#password</span> needed to unlock
          payment info.
        </p>
      )}
    </SectionCard>
  );
}
