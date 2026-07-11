import { cn } from "@/lib/utils";

import { BackLink } from "./back-link";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  centered?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  centered = false,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", centered && "text-center", className)}>
      {backHref ? (
        <BackLink href={backHref} label={backLabel} />
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
