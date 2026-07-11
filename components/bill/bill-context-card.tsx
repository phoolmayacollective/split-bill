import { Receipt } from "lucide-react";

import { MoneyAmount } from "@/components/bill/money-amount";
import { SectionCard } from "@/components/layout/section-card";
import type { BillTotals } from "@/lib/database.types";

type BillContextCardProps = {
  itemCount: number;
  totals: BillTotals;
};

export function BillContextCard({ itemCount, totals }: BillContextCardProps) {
  return (
    <SectionCard className="flex items-center gap-4">
      <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
        <Receipt className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-sm">
          {itemCount} {itemCount === 1 ? "item" : "items"} on this bill
        </p>
        <p className="text-lg font-semibold">
          Total <MoneyAmount amount={totals.total} size="lg" />
        </p>
      </div>
    </SectionCard>
  );
}
