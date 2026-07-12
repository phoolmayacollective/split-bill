import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-auto border-t px-4 py-6 sm:px-6">
      <div className="text-muted-foreground mx-auto flex max-w-md flex-col items-center gap-2 text-center text-sm">
        <nav aria-label="Site">
          <Link
            href="/features"
            className="hover:text-foreground transition-colors"
          >
            How it works
          </Link>
        </nav>
        <p className="text-xs">Split Bill — no account needed.</p>
      </div>
    </footer>
  );
}
