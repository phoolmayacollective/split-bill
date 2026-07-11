import { MoneyAmount } from "@/components/bill/money-amount";
import { cn } from "@/lib/utils";

export type MoneyLine = {
  label: string;
  amount: number;
  muted?: boolean;
};

type MoneyBreakdownProps = {
  lines: MoneyLine[];
  totalLabel?: string;
  total: number;
  className?: string;
};

export function MoneyBreakdown({
  lines,
  totalLabel = "Total",
  total,
  className,
}: MoneyBreakdownProps) {
  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-3">
          <dt className={cn(line.muted !== false && "text-muted-foreground")}>
            {line.label}
          </dt>
          <dd>
            <MoneyAmount amount={line.amount} size="sm" />
          </dd>
        </div>
      ))}
      <div className="border-border border-t pt-2">
        <div className="flex justify-between gap-3 text-base">
          <dt className="font-medium">{totalLabel}</dt>
          <dd>
            <MoneyAmount amount={total} size="md" />
          </dd>
        </div>
      </div>
    </dl>
  );
}
