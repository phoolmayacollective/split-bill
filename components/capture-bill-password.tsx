"use client";

import { useEffect } from "react";

import { syncBillPasswordFromHash } from "@/lib/bill-password";

type CaptureBillPasswordProps = {
  billId: string;
};

export function CaptureBillPassword({ billId }: CaptureBillPasswordProps) {
  useEffect(() => {
    syncBillPasswordFromHash(billId);

    function handleHashChange() {
      syncBillPasswordFromHash(billId);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [billId]);

  return null;
}
