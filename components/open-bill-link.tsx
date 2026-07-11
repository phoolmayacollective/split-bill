"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link2 } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseBillPath(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.startsWith("/")
      ? new URL(trimmed, window.location.origin)
      : new URL(trimmed);

    const match = url.pathname.match(/^\/bill\/([^/]+)(?:\/(.*))?$/);
    if (!match) {
      return null;
    }

    const billId = match[1];
    const subpath = match[2];
    const allowed = new Set(["name", "items", "summary", "payer", "share"]);
    const pathSuffix =
      subpath && allowed.has(subpath.split("/")[0] ?? "") ? `/${subpath}` : "";

    return `/bill/${billId}${pathSuffix}${url.hash}`;
  } catch {
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return `/bill/${trimmed}/name`;
    }
    return null;
  }
}

export function OpenBillLink() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const path = parseBillPath(value);
    if (!path) {
      setError("Paste a full bill link or just the bill ID.");
      return;
    }

    router.push(path);
  }

  return (
    <SectionCard
      title="Have a link?"
      description="Paste the bill link someone shared with you."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="open-bill-link" className="sr-only">
            Bill link
          </Label>
          <Input
            id="open-bill-link"
            type="url"
            inputMode="url"
            placeholder="https://…/bill/abc123#password"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            autoComplete="off"
          />
        </div>
        {error ? <ErrorMessage message={error} /> : null}
        <Button type="submit" variant="outline" className="w-full">
          <Link2 aria-hidden />
          Open bill
        </Button>
      </form>
    </SectionCard>
  );
}
