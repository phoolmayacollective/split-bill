import { cn } from "@/lib/utils";

import { BackLink } from "./back-link";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  /** Top-left slot; takes precedence over backHref */
  leading?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Renders top-right, e.g. sign out on dashboard */
  trailing?: React.ReactNode;
  centered?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  leading,
  backHref,
  backLabel,
  trailing,
  centered = false,
  icon,
  className,
}: PageHeaderProps) {
  const topStart = leading ?? (backHref ? (
    <BackLink href={backHref} label={backLabel} />
  ) : null);

  return (
    <header className={cn("space-y-3", centered && "text-center", className)}>
      {topStart || trailing ? (
        <div
          className={cn(
            "flex items-center gap-3",
            trailing ? "justify-between" : "",
          )}
        >
          {topStart ?? <span aria-hidden />}
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
      ) : null}
      {icon ? (
        <div className={cn("flex", centered && "justify-center")}>{icon}</div>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
