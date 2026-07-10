import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OwerItemsPage } from "@/components/ower-items-page";
import { getBillById, normalizeBill } from "@/lib/db/bills";

type OwerItemsRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OwerItemsRouteProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Claim items — Split Bill`,
    description: `Select the items you owe on bill ${id}.`,
  };
}

export default async function OwerItemsRoute({ params }: OwerItemsRouteProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  const normalized = normalizeBill(bill);

  return (
    <OwerItemsPage
      billId={id}
      items={normalized.items}
      totals={normalized.totals}
      existingClaims={normalized.claims.map((claim) => ({
        ower_name: claim.ower_name,
        item_id: claim.item_id,
        share: Number(claim.share),
      }))}
    />
  );
}
