"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { PageShell } from "@/components/layout/page-shell";

type ShareBillRedirectProps = {
  billId: string;
};

export function ShareBillRedirect({ billId }: ShareBillRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/bill/${billId}/payer${window.location.hash}`);
  }, [billId, router]);

  return (
    <PageShell centered>
      <LoadingState message="Loading your bill…" />
    </PageShell>
  );
}
