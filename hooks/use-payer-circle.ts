"use client";

import { useEffect, useState } from "react";

export function usePayerCircle(): {
  circleMembers: string[];
  isLoading: boolean;
} {
  const [circleMembers, setCircleMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCircle() {
      try {
        const response = await fetch("/api/payer/circle");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          members?: Array<{ username: string }>;
        };

        if (!cancelled) {
          setCircleMembers(
            (data.members ?? []).map((member) => member.username),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCircle();

    return () => {
      cancelled = true;
    };
  }, []);

  return { circleMembers, isLoading };
}
