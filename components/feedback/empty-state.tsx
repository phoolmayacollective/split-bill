import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center",
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
