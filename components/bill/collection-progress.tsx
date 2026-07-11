import { MoneyAmount } from "@/components/bill/money-amount";
import { cn } from "@/lib/utils";

type CollectionProgressProps = {
  paid: number;
  owed: number;
  paidCount: number;
  owerCount: number;
  className?: string;
};

export function CollectionProgress({
  paid,
  owed,
  paidCount,
  owerCount,
  className,
}: CollectionProgressProps) {
  const percent = owed > 0 ? Math.min(100, Math.round((paid / owed) * 100)) : 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {paidCount}/{owerCount} people paid
        </p>
        {owerCount > 0 ? (
          <p className="text-lg font-semibold">
            <MoneyAmount amount={paid} size="lg" />
            <span className="text-muted-foreground text-sm font-normal">
              {" "}
              / <MoneyAmount amount={owed} size="sm" className="inline" />
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">No claims yet</p>
        )}
      </div>

      {owerCount > 0 ? (
        <div
          className="bg-muted h-3 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent}% collected`}
        >
          <div
            className="bg-success h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
