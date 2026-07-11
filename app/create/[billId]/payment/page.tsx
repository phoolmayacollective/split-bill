import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PaymentForm } from "@/components/payment-form";
import { getBillById } from "@/lib/db/bills";
import { getBillSharePath } from "@/lib/share-url";

type PaymentPageProps = {
  params: Promise<{ billId: string }>;
};

export async function generateMetadata({
  params,
}: PaymentPageProps): Promise<Metadata> {
  const { billId } = await params;

  return {
    title: `Payment details — Split Bill`,
    description: `Add encrypted payment details for bill ${billId}.`,
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { billId } = await params;
  const bill = await getBillById(billId);

  if (!bill) {
    notFound();
  }

  if (bill.payment_enc) {
    redirect(`${getBillSharePath(billId)}/payer`);
  }

  return <PaymentForm billId={billId} />;
}
