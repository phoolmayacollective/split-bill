import Link from "next/link";
import { Receipt } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <PageShell centered className="justify-center py-16">
      <div className="bg-muted text-muted-foreground mx-auto flex size-16 items-center justify-center rounded-2xl">
        <Receipt className="size-8" aria-hidden />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Bill not found</h1>
        <p className="text-muted-foreground leading-relaxed">
          This link may be broken or the bill may have been removed. Double-check
          the URL — including the password after{" "}
          <span className="font-mono text-xs">#</span>.
        </p>
      </div>

      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Go home
      </Link>
    </PageShell>
  );
}
