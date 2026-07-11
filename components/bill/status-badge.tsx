import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "paid" | "pending" | "unclaimed" | "settled";
  className?: string;
};

const styles: Record<StatusBadgeProps["status"], string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  unclaimed: "bg-muted text-muted-foreground border-border",
  settled: "bg-success/10 text-success border-success/20",
};

const labels: Record<StatusBadgeProps["status"], string> = {
  paid: "Paid",
  pending: "Pending",
  unclaimed: "Unclaimed",
  settled: "All paid",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
