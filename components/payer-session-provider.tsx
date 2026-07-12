"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PayerInfo = {
  id: string;
  username: string;
};

type PayerSessionContextValue = {
  payer: PayerInfo | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
};

const PayerSessionContext = createContext<PayerSessionContextValue | null>(null);

async function fetchPayerSession(): Promise<PayerInfo | null> {
  const response = await fetch("/api/payer/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { payer?: PayerInfo };
  return data.payer ?? null;
}

export function PayerSessionProvider({ children }: { children: React.ReactNode }) {
  const [payer, setPayer] = useState<PayerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const nextPayer = await fetchPayerSession();
    setPayer(nextPayer);
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setPayer(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const nextPayer = await fetchPayerSession();
        if (!cancelled) {
          setPayer(nextPayer);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      payer,
      isLoading,
      isLoggedIn: payer !== null,
      refresh,
      clear,
    }),
    [payer, isLoading, refresh, clear],
  );

  return (
    <PayerSessionContext.Provider value={value}>
      {children}
    </PayerSessionContext.Provider>
  );
}

export function usePayerSession(): PayerSessionContextValue {
  const context = useContext(PayerSessionContext);

  if (!context) {
    throw new Error("usePayerSession must be used within PayerSessionProvider");
  }

  return context;
}
