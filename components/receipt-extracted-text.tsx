"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReceiptExtractedTextProps = {
  lines: string[];
  lineConfidences?: number[];
  formatConfidence?: (confidence: number) => string;
};

export function ReceiptExtractedText({
  lines,
  lineConfidences = [],
  formatConfidence = (confidence) => `${Math.round(confidence)}%`,
}: ReceiptExtractedTextProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(index: number, line: string) {
    await copy(line);
    setCopiedIndex(index);
    window.setTimeout(() => {
      setCopiedIndex((current) => (current === index ? null : current));
    }, 2000);
  }

  return (
    <details className="mt-2" open={lines.length <= 8}>
      <summary className="cursor-pointer text-sm font-medium">
        Show extracted text ({lines.length}{" "}
        {lines.length === 1 ? "line" : "lines"})
      </summary>
      <p className="text-muted-foreground mt-2 text-xs">
        Tap a line to copy it.
      </p>
      <ul className="mt-3 space-y-1">
        {lines.map((line, index) => {
          const isSelected = selectedIndex === index;
          const isCopied = copiedIndex === index && copied;
          const confidence = lineConfidences[index] ?? 0;

          return (
            <li
              key={`${index}-${line}`}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                isSelected
                  ? "border-primary/30 bg-muted"
                  : "border-transparent hover:bg-muted/60",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((current) =>
                    current === index ? null : index,
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="font-mono break-all">{line}</span>
                {confidence > 0 ? (
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {formatConfidence(confidence)}
                  </span>
                ) : null}
              </button>

              {isSelected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0"
                  aria-label={`Copy line ${index + 1}`}
                  onClick={() => void handleCopy(index, line)}
                >
                  {isCopied ? <Check /> : <Copy />}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
