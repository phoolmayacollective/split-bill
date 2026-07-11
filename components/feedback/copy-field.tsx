"use client";

import { Check, Copy, Share2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CopyFieldProps = {
  value: string;
  label?: string;
  /** Show as readonly input + copy button (share link style) */
  variant?: "field" | "button";
  className?: string;
  /** Enable Web Share API when available */
  allowShare?: boolean;
};

function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function CopyField({
  value,
  label = "Copy",
  variant = "field",
  className,
  allowShare = false,
}: CopyFieldProps) {
  const { copied, copy } = useCopyToClipboard();
  const showShare = allowShare && canUseWebShare();

  async function handleShare() {
    try {
      await navigator.share({ url: value, title: "Split Bill" });
      return;
    } catch {
      // User cancelled or share failed — fall back to copy
    }
    await copy(value);
  }

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void copy(value)}
        className={cn("shrink-0", className)}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : `Copy ${label}`}
      </Button>
    );
  }

  return (
    <div className={cn("flex w-full gap-2", className)}>
      <Input
        readOnly
        value={value}
        aria-label={label}
        className="font-mono text-sm"
        onFocus={(event) => event.target.select()}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => void copy(value)}
        className="h-11 shrink-0"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
      {showShare ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleShare()}
          className="size-11 shrink-0"
          aria-label="Share link"
        >
          <Share2 />
        </Button>
      ) : null}
    </div>
  );
}
