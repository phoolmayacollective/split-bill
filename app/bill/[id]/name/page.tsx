import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OwerNameForm } from "@/components/ower-name-form";
import { getBillById, normalizeBill } from "@/lib/db/bills";

type OwerNamePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OwerNamePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Your name — Split Bill`,
    description: `Enter your name to claim items on bill ${id}.`,
  };
}

export default async function OwerNamePage({ params }: OwerNamePageProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  const normalized = normalizeBill(bill);

  return (
    <OwerNameForm
      billId={id}
      participants={normalized.participants}
      itemCount={normalized.items.length}
      totals={normalized.totals}
    />
  );
}
