import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export function LoadingState({
  message = "Loading…",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {message}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse space-y-3", className)}
      role="status"
      aria-label="Loading"
    >
      <div className="bg-muted h-24 rounded-xl" />
      <div className="bg-muted h-16 rounded-xl" />
      <div className="bg-muted h-16 rounded-xl" />
    </div>
  );
}
