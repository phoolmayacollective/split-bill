import type { ItemProgress } from "@/lib/item-progress";
import { cn } from "@/lib/utils";

type ItemProgressBarProps = {
  progress: ItemProgress;
};

export function ItemProgressBar({ progress }: ItemProgressBarProps) {
  if (progress.status === "unclaimed") {
    return (
      <div
        className="bg-muted h-2.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${progress.item_name} — unclaimed`}
      >
        <div className="bg-muted-foreground/15 h-full w-full" />
      </div>
    );
  }

  const segments = progress.claimants.map((claimant) => ({
    key: claimant.ower_name,
    width: claimant.share * 100,
    paid: claimant.paid,
  }));
  const unclaimedWidth = Math.max(0, (1 - progress.claimed_share) * 100);

  return (
    <div
      className="bg-muted flex h-2.5 overflow-hidden rounded-full"
      role="progressbar"
      aria-valuenow={progress.percent_paid}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${progress.item_name} — ${progress.percent_paid}% paid`}
    >
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={cn(
            "h-full transition-colors",
            segment.paid ? "bg-success" : "bg-primary/30",
          )}
          style={{ width: `${segment.width}%` }}
        />
      ))}
      {unclaimedWidth > 0 ? (
        <div
          className="bg-muted-foreground/15 h-full"
          style={{ width: `${unclaimedWidth}%` }}
        />
      ) : null}
    </div>
  );
}

export function progressLabel(progress: ItemProgress): string {
  if (progress.status === "unclaimed") {
    return "Unclaimed";
  }

  if (progress.status === "settled") {
    return "All paid";
  }

  if (progress.percent_claimed < 100) {
    return `${progress.percent_claimed}% claimed · ${progress.percent_paid}% paid`;
  }

  return `${progress.percent_paid}% paid`;
}
