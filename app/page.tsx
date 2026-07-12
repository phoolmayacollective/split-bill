import Image from "next/image";

import { HomePageActions } from "@/components/home-page-actions";
import { HowItWorks } from "@/components/how-it-works";
import { OpenBillLink } from "@/components/open-bill-link";
import { PageShell } from "@/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell centered className="justify-center py-8 sm:py-12">
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

      <HomePageActions />

      <OpenBillLink />

      <HowItWorks />
    </PageShell>
  );
}
