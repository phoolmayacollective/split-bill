import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OwerSummaryPage } from "@/components/ower-summary-page";
import { getBillById } from "@/lib/db/bills";

type OwerSummaryRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OwerSummaryRouteProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Your total — Split Bill`,
    description: `View what you owe on bill ${id}.`,
  };
}

export default async function OwerSummaryRoute({
  params,
}: OwerSummaryRouteProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  return <OwerSummaryPage billId={id} />;
}
