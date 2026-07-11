import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PayerBillPage } from "@/components/payer-bill-page";
import { getBillById } from "@/lib/db/bills";

type PayerBillRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PayerBillRouteProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Your bill — Split Bill`,
    description: `Track claims and payments on bill ${id}.`,
  };
}

export default async function PayerBillRoute({ params }: PayerBillRouteProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  return <PayerBillPage billId={id} />;
}
