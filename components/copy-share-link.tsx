"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CopyShareLinkProps = {
  shareUrl: string;
};

export function CopyShareLink({ shareUrl }: CopyShareLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without a user gesture
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex w-full gap-2">
      <Input
        readOnly
        value={shareUrl}
        aria-label="Share link"
        className="h-10 font-mono text-sm"
        onFocus={(event) => event.target.select()}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
