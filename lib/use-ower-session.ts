"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getOwerName } from "@/lib/ower-session";

/** Read ower name after mount and redirect to /name only when truly missing. */
export function useOwerSession(billId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [owerName, setOwerName] = useState<string | null>(null);

  useEffect(() => {
    setOwerName(getOwerName(billId));
    setReady(true);
  }, [billId]);

  useEffect(() => {
    if (!ready || owerName || pathname.endsWith("/name")) {
      return;
    }

    router.replace(
      `/bill/${billId}/name${window.location.search}${window.location.hash}`,
    );
  }, [billId, owerName, pathname, ready, router]);

  return { ready, owerName };
}
