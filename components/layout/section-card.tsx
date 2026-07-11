import { cn } from "@/lib/utils";

type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  title?: string;
  description?: React.ReactNode;
  highlight?: boolean;
};

export function SectionCard({
  children,
  className,
  id,
  title,
  description,
  highlight = false,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "shadow-card space-y-4 rounded-xl border bg-card p-4 sm:p-5",
        highlight && "border-primary/30 bg-primary/5",
        className,
      )}
    >
      {title || description ? (
        <div className="space-y-1">
          {title ? <h2 className="font-medium">{title}</h2> : null}
          {description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
