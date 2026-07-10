"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOwerName, setOwerName } from "@/lib/ower-session";

type OwerNameFormProps = {
  billId: string;
};

export function OwerNameForm({ billId }: OwerNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState(() => getOwerName(billId) ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();

    if (!trimmed) {
      setError("Enter your name so others know what you claimed.");
      return;
    }

    setOwerName(billId, trimmed);
    router.push(`/bill/${billId}/items`);
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            What&apos;s your name?
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            This is how you&apos;ll appear on the bill. No account needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ower-name">Your name</Label>
            <Input
              id="ower-name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              autoFocus
              className="h-11"
            />
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="h-11 w-full">
            Continue
          </Button>
        </form>
      </main>
    </div>
  );
}
