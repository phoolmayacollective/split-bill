import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CopyShareLink } from "@/components/copy-share-link";
import { getBillById } from "@/lib/db/bills";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Share bill — Split Bill`,
    description: `Share this link so others can claim items on bill ${id}.`,
  };
}

function getShareUrl(billId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${baseUrl}/bill/${billId}`;
}

export default async function ShareBillPage({ params }: SharePageProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  const shareUrl = getShareUrl(id);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full text-xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bill created
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Share this link with everyone who needs to claim their items. No
            sign-up required.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Share link</p>
          <CopyShareLink shareUrl={shareUrl} />
          <p className="text-muted-foreground text-sm">
            Owers will open{" "}
            <span className="font-mono text-xs">/bill/{id}</span> to claim what
            they owe.
          </p>
        </div>
      </main>
    </div>
  );
}
