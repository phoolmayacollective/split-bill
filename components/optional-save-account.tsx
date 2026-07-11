"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OptionalSaveAccountProps = {
  billId: string;
};

export function OptionalSaveAccount({ billId }: OptionalSaveAccountProps) {
  const [dismissed, setDismissed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  if (dismissed || saved) {
    return saved ? (
      <p className="text-muted-foreground text-center text-sm">
        Saved to <span className="text-foreground font-medium">{username}</span>
        . Your dashboard is coming soon — keep your share link for now.
      </p>
    ) : null;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername.length < 2) {
      setError("Pick a username — at least 2 characters.");
      return;
    }

    if (trimmedPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authResponse = await fetch("/api/payer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          password: trimmedPassword,
        }),
      });

      const authData = (await authResponse.json()) as { error?: string };

      if (!authResponse.ok) {
        setError(authData.error ?? "Something went wrong. Try again.");
        return;
      }

      const linkResponse = await fetch(`/api/bills/${billId}/payer/link`, {
        method: "POST",
      });

      const linkData = (await linkResponse.json()) as { error?: string };

      if (!linkResponse.ok) {
        setError(linkData.error ?? "Could not link this bill to your username.");
        return;
      }

      setSaved(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Find this bill later? (optional)"
      description="No account needed to use the app. Pick a username if you want to come back to this bill once dashboards launch."
      className="border-dashed"
    >
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setDismissed(true)}
        disabled={isSubmitting}
      >
        Continue as guest — I&apos;ll use my share link
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">or</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="save-username">Username</Label>
          <Input
            id="save-username"
            autoComplete="username"
            placeholder="e.g. alex"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="save-password">Password</Label>
          <div className="flex gap-2">
            <Input
              id="save-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 4 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save with username"}
        </Button>
      </form>
    </SectionCard>
  );
}
