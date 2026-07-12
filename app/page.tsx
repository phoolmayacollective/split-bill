import Image from "next/image";
import Link from "next/link";

import { HowItWorks } from "@/components/how-it-works";
import { OpenBillLink } from "@/components/open-bill-link";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <PageShell centered className="justify-center py-12 sm:py-16">
      <Image
        src="/icon.png"
        alt=""
        width={64}
        height={64}
        className="mx-auto size-16 rounded-2xl shadow-card"
        priority
        aria-hidden
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Split Bill
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Split a shared bill with friends. Create, share the link, and
          everyone claims what they owe — no account needed.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/create/manual"
          className={cn(buttonVariants({ size: "lg" }), "shadow-card w-full")}
        >
          Create a bill
        </Link>
      </div>

      <OpenBillLink />

      <HowItWorks />
    </PageShell>
  );
}
