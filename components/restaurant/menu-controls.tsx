"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/restaurants/format-euro";
import { cn } from "@/lib/utils";

type QtyControlsProps = {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
};

export function QtyControls({
  qty,
  onIncrement,
  onDecrement,
  className,
}: QtyControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onDecrement}
        disabled={qty <= 0}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className="min-w-6 text-center font-mono text-sm tabular-nums">
        {qty}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}

type EuroAmountProps = {
  amount: number;
  className?: string;
};

export function EuroAmount({ amount, className }: EuroAmountProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatEuro(amount)}
    </span>
  );
}
