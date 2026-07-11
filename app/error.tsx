"use client";

import { useEffect } from "react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell centered>
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <ErrorMessage
          message="We couldn't load this page. Please try again."
          centered
        />
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </PageShell>
  );
}
