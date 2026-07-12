import { SiteFooterNav } from "@/components/layout/site-footer-nav";

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-auto border-t px-4 py-6 sm:px-6">
      <div className="text-muted-foreground mx-auto flex max-w-md flex-col items-center gap-2 text-center text-sm">
        <SiteFooterNav />
        <p className="text-xs">Split Bill — no account needed.</p>
      </div>
    </footer>
  );
}
