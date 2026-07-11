import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/bill-totals";

type MoneyAmountProps = {
  amount: number;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const sizeClasses = {
  sm: "text-sm font-medium",
  md: "text-base font-semibold",
  lg: "text-lg font-semibold",
  hero: "text-3xl font-bold tracking-tight sm:text-4xl",
};

export function MoneyAmount({
  amount,
  size = "md",
  className,
}: MoneyAmountProps) {
  return (
    <span
      className={cn("font-mono tabular-nums", sizeClasses[size], className)}
    >
      {formatMoney(amount)}
    </span>
  );
}
