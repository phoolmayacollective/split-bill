"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";

import { BillContextCard } from "@/components/bill/bill-context-card";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StepIndicator } from "@/components/layout/step-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillTotals } from "@/lib/database.types";
import { matchRosterName } from "@/lib/participants";
import { getOwerName, setOwerName } from "@/lib/ower-session";

const OWER_STEPS = [
  { label: "Name" },
  { label: "Items" },
  { label: "Summary" },
];

type OwerNameFormProps = {
  billId: string;
  participants?: string[];
  itemCount?: number;
  totals?: BillTotals;
};

export function OwerNameForm({
  billId,
  participants = [],
  itemCount = 0,
  totals,
}: OwerNameFormProps) {
  const router = useRouter();
  const savedName = getOwerName(billId) ?? "";
  const savedRosterMatch = matchRosterName(participants, savedName);
  const hasRoster = participants.length > 0;

  const [selectedRosterName, setSelectedRosterName] = useState<string | null>(
    () => savedRosterMatch,
  );
  const [useCustomName, setUseCustomName] = useState(
    () => hasRoster && savedName.length > 0 && !savedRosterMatch,
  );
  const [customName, setCustomName] = useState(
    () => (savedRosterMatch ? "" : savedName),
  );
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  function resolveName(): string | null {
    if (hasRoster && !useCustomName && selectedRosterName) {
      return selectedRosterName;
    }

    const trimmed = customName.trim();
    if (!trimmed) {
      return null;
    }

    return matchRosterName(participants, trimmed) ?? trimmed;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const resolved = resolveName();

    if (!resolved) {
      setError(
        hasRoster && !useCustomName
          ? "Pick your name from the list."
          : "Enter your name so others know what you claimed.",
      );
      return;
    }

    setOwerName(billId, resolved);
    setIsNavigating(true);
    router.push(`/bill/${billId}/items`);
  }

  function selectRosterName(name: string) {
    setSelectedRosterName(name);
    setUseCustomName(false);
    setCustomName("");
    setError(null);
  }

  function enableCustomName() {
    setUseCustomName(true);
    setSelectedRosterName(null);
    setError(null);
  }

  if (isNavigating) {
    return (
      <PageShell centered>
        <LoadingState message="Loading items…" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AppPageHeader
        title="What's your name?"
        description={
          hasRoster
            ? "Pick your name from the list, or enter it manually if you're not listed."
            : "This is how you'll appear on the bill. No account needed."
        }
        icon={
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <User className="size-6" aria-hidden />
          </div>
        }
        centered
      />

      <StepIndicator steps={OWER_STEPS} currentStep={1} />

      {totals && itemCount > 0 ? (
        <BillContextCard itemCount={itemCount} totals={totals} />
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasRoster ? (
          <div className="space-y-3">
            <Label>On this bill</Label>
            <div className="flex flex-wrap gap-2">
              {participants.map((name) => {
                const isSelected =
                  !useCustomName && selectedRosterName === name;

                return (
                  <Button
                    key={name}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-11 rounded-full px-5"
                    aria-pressed={isSelected}
                    onClick={() => selectRosterName(name)}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        {hasRoster && !useCustomName ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground h-auto px-0 py-1 text-sm"
            onClick={enableCustomName}
          >
            Someone else
          </Button>
        ) : null}

        {!hasRoster || useCustomName ? (
          <div className="space-y-2">
            <Label htmlFor="ower-name">Your name</Label>
            <Input
              id="ower-name"
              placeholder="e.g. Alex"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              autoComplete="name"
              autoFocus
            />
          </div>
        ) : null}

        {hasRoster && useCustomName ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground h-auto px-0 py-1 text-sm"
            onClick={() => {
              setUseCustomName(false);
              setCustomName("");
              setError(null);
            }}
          >
            Back to list
          </Button>
        ) : null}

        {error ? <ErrorMessage message={error} centered /> : null}

        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </form>
    </PageShell>
  );
}
