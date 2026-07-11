import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Extra bottom padding for sticky footers */
  withStickyFooter?: boolean;
  /** Wider layout for dashboard-style pages */
  wide?: boolean;
  centered?: boolean;
};

export function PageShell({
  children,
  className,
  withStickyFooter = false,
  wide = false,
  centered = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col px-4 py-8 sm:px-6",
        withStickyFooter && "pb-28",
        className,
      )}
    >
      <main
        className={cn(
          "mx-auto flex w-full flex-col gap-6 sm:gap-8",
          wide ? "max-w-lg" : "max-w-md",
          centered && "items-center text-center",
        )}
      >
        {children}
      </main>
    </div>
  );
}
