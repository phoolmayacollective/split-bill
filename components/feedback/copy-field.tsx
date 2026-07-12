"use client";

import { Check, Copy, Share2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  canUseWebShare,
  shareValue,
  type SharePayloadMode,
} from "@/lib/web-share";
import { cn } from "@/lib/utils";

type CopyFieldProps = {
  value: string;
  label?: string;
  /** Show as readonly input + copy button (share link style) */
  variant?: "field" | "button";
  className?: string;
  /** Enable Web Share API when available */
  allowShare?: boolean;
  /** Share as a URL or plain text (passwords, etc.) */
  shareAs?: SharePayloadMode;
};

export function CopyField({
  value,
  label = "Copy",
  variant = "field",
  className,
  allowShare = false,
  shareAs = "url",
}: CopyFieldProps) {
  const { copied, copy } = useCopyToClipboard();
  const showShare = allowShare && canUseWebShare();
  const shareTitle = label === "Copy" ? "Split Bill" : label;

  async function handleShare() {
    const shared = await shareValue(value, {
      mode: shareAs,
      title: shareTitle,
    });

    if (!shared) {
      await copy(value);
    }
  }

  if (variant === "button") {
    return (
      <div className={cn("flex shrink-0 gap-1.5", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void copy(value)}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : `Copy ${label}`}
        </Button>
        {showShare ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleShare()}
            className="size-11 shrink-0"
            aria-label={`Share ${label}`}
          >
            <Share2 />
          </Button>
        ) : null}
      </div>
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
          aria-label={`Share ${label}`}
        >
          <Share2 />
        </Button>
      ) : null}
    </div>
  );
}
