"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Receipt, UserMinus } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { PayerHeaderTrailing } from "@/components/layout/payer-header-trailing";
import { SectionCard } from "@/components/layout/section-card";
import { usePayerSession } from "@/components/payer-session-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/restaurants/format-euro";
import { cn } from "@/lib/utils";

type PayerInfo = {
  id: string;
  username: string;
};

type BillSummary = {
  id: string;
  createdAt: string;
  total: number;
  itemCount: number;
  participantCount: number;
};

type CircleMember = {
  payerId: string;
  username: string;
  addedAt: string;
};

function formatBillDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PayerDashboardPage() {
  const { payer, isLoading: isSessionLoading, refresh } = usePayerSession();
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [circle, setCircle] = useState<CircleMember[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [circleDraft, setCircleDraft] = useState("");
  const [circleError, setCircleError] = useState<string | null>(null);
  const [isAddingToCircle, setIsAddingToCircle] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);

    const response = await fetch("/api/payer/bills");
    if (response.status === 401) {
      setBills([]);
      setCircle([]);
      return;
    }

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Could not load your dashboard.");
    }

    const data = (await response.json()) as {
      payer: PayerInfo;
      bills: BillSummary[];
    };

    setBills(data.bills);

    const circleResponse = await fetch("/api/payer/circle");
    if (circleResponse.ok) {
      const circleData = (await circleResponse.json()) as {
        members?: CircleMember[];
      };
      setCircle(circleData.members ?? []);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading || !payer) {
      return;
    }

    let cancelled = false;

    async function init() {
      setIsLoadingBills(true);
      try {
        await loadDashboard();
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBills(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [isSessionLoading, payer, loadDashboard]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignInError(null);
    setIsSigningIn(true);

    try {
      const response = await fetch("/api/payer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSignInError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setPassword("");
      setIsLoadingBills(true);
      await refresh();
      await loadDashboard();
    } catch {
      setSignInError("Something went wrong. Try again.");
    } finally {
      setIsSigningIn(false);
      setIsLoadingBills(false);
    }
  }

  async function handleAddToCircle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCircleError(null);
    setIsAddingToCircle(true);

    try {
      const response = await fetch("/api/payer/circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: circleDraft.trim() }),
      });

      const data = (await response.json()) as {
        error?: string;
        member?: CircleMember;
      };

      if (!response.ok) {
        setCircleError(data.error ?? "Could not add to your circle.");
        return;
      }

      if (data.member) {
        setCircle((current) => [...current, data.member!]);
      }

      setCircleDraft("");
    } catch {
      setCircleError("Could not add to your circle.");
    } finally {
      setIsAddingToCircle(false);
    }
  }

  async function handleRemoveFromCircle(memberPayerId: string) {
    setCircleError(null);
    setRemovingMemberId(memberPayerId);

    try {
      const response = await fetch(`/api/payer/circle/${memberPayerId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setCircleError(data.error ?? "Could not remove from your circle.");
        return;
      }

      setCircle((current) =>
        current.filter((member) => member.payerId !== memberPayerId),
      );
    } catch {
      setCircleError("Could not remove from your circle.");
    } finally {
      setRemovingMemberId(null);
    }
  }

  if (isSessionLoading) {
    return (
      <PageShell wide>
        <AppPageHeader
          title="Your bills"
          description="Loading…"
        />
      </PageShell>
    );
  }

  if (!payer) {
    return (
      <PageShell wide>
        <AppPageHeader
          title="Your bills"
          description="Sign in with your username to see bills you've saved and people you split with often."
        />

        {error ? <ErrorMessage message={error} /> : null}

        <SectionCard
          title="Welcome back"
          description="New here? Pick a username and password — we'll create your account automatically."
        >
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-username">Username</Label>
              <Input
                id="dashboard-username"
                autoComplete="username"
                placeholder="e.g. alex"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isSigningIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="dashboard-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSigningIn}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSigningIn}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {signInError ? <ErrorMessage message={signInError} /> : null}

            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? "Signing in…" : "Continue"}
            </Button>
          </form>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <AppPageHeader
        title={`Hi, ${payer.username}`}
        description="Your saved bills and circle — optional, but handy when you split often."
        trailing={<PayerHeaderTrailing showSignOut />}
      />

      {isLoadingBills ? (
        <p className="text-muted-foreground text-sm">Loading your bills…</p>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}

      <SectionCard
        title="Your bills"
        description={
          bills.length > 0
            ? "Open a bill to track claims and payments."
            : "No saved bills yet — create one and link it with your username after sharing."
        }
      >
        {bills.length > 0 ? (
          <ul className="divide-y rounded-xl border">
            {bills.map((bill) => (
              <li key={bill.id}>
                <Link
                  href={`/bill/${bill.id}/payer`}
                  className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
                >
                  <Receipt className="text-muted-foreground size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{formatEuro(bill.total)}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatBillDate(bill.createdAt)} · {bill.itemCount}{" "}
                      {bill.itemCount === 1 ? "item" : "items"}
                      {bill.participantCount > 0
                        ? ` · ${bill.participantCount} on roster`
                        : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link
            href="/create/manual"
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            Create a bill
          </Link>
        )}
      </SectionCard>

      <SectionCard
        title="People you split with often"
        description={
          circle.length > 0
            ? "Add registered usernames for one-tap roster picks when you create a bill."
            : "Save friends who have usernames — they'll show up as quick-add chips when you start a new bill."
        }
      >
        {circle.length > 0 ? (
          <ul className="space-y-2">
            {circle.map((member) => (
              <li
                key={member.payerId}
                className="bg-background flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <span className="font-medium">{member.username}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${member.username} from circle`}
                  disabled={removingMemberId === member.payerId}
                  onClick={() => handleRemoveFromCircle(member.payerId)}
                >
                  <UserMinus />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Your circle is empty — add someone below.
          </p>
        )}

        <form onSubmit={handleAddToCircle} className="flex gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="circle-username" className="sr-only">
              Username to add
            </Label>
            <Input
              id="circle-username"
              placeholder="e.g. bob"
              value={circleDraft}
              onChange={(event) => setCircleDraft(event.target.value)}
              disabled={isAddingToCircle}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="mt-auto shrink-0"
            disabled={!circleDraft.trim() || isAddingToCircle}
          >
            <Plus />
            Add
          </Button>
        </form>

        {circleError ? <ErrorMessage message={circleError} /> : null}
      </SectionCard>
    </PageShell>
  );
}
