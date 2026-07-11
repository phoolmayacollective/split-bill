"use client";

import { useSyncExternalStore } from "react";
import { Link2, Shield } from "lucide-react";

import { CopyField } from "@/components/feedback/copy-field";
import { SectionCard } from "@/components/layout/section-card";
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
  const shareUrl = getBillShareUrl(billId, {
    password: password || undefined,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  });

  return (
    <SectionCard
      title="Share with friends"
      description="Friends open this link to claim what they owe. Your dashboard stays at /payer."
    >
      <div className="space-y-2">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
          <Link2 className="size-3.5" aria-hidden />
          Ower link
        </p>
        <CopyField
          value={shareUrl}
          label="Share link"
          allowShare
        />
      </div>

      {hasPassword ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <Shield className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
          This link includes your password. Only share with people who need to
          pay you.
        </p>
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
