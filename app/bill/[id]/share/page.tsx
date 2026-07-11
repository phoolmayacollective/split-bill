import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShareBillRedirect } from "@/components/share-bill-redirect";
import { getBillById } from "@/lib/db/bills";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Your bill — Split Bill`,
    description: `Track claims and payments on bill ${id}.`,
  };
}

export default async function ShareBillPage({ params }: SharePageProps) {
  const { id } = await params;

  const bill = await getBillById(id);

  if (!bill) {
    notFound();
  }

  return <ShareBillRedirect billId={id} />;
}
