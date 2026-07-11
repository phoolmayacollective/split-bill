import { cn } from "@/lib/utils";

type StickyActionBarProps = {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export function StickyActionBar({
  children,
  className,
  wide = false,
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface-elevated/95 supports-backdrop-filter:bg-surface-elevated/80 shadow-card fixed inset-x-0 bottom-0 border-t backdrop-blur",
        className,
      )}
    >
      <div
        className={cn(
          "safe-area-bottom mx-auto w-full px-4 pt-4 sm:px-6",
          wide ? "max-w-lg" : "max-w-md",
        )}
      >
        {children}
      </div>
    </div>
  );
}
