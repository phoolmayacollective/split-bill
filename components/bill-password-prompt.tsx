"use client";

import { useState } from "react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BillPasswordPromptProps = {
  onSubmit: (password: string) => void;
  error?: string | null;
  isSubmitting?: boolean;
  title?: string;
  description?: React.ReactNode;
  label?: string;
  submitLabel?: string;
};

export function BillPasswordPrompt({
  onSubmit,
  error,
  isSubmitting = false,
  title = "Unlock payment details",
  description = (
    <>
      Enter the password from your share link — the part after{" "}
      <span className="font-mono text-xs">#</span> in the URL.
    </>
  ),
  label = "Link password",
  submitLabel = "Unlock",
}: BillPasswordPromptProps) {
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <SectionCard title={title} description={description}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="bill-password">{label}</Label>
          <Input
            id="bill-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="font-mono text-sm"
            autoFocus
          />
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || password.trim().length === 0}
        >
          {isSubmitting ? "Unlocking…" : submitLabel}
        </Button>
      </form>
    </SectionCard>
  );
}
