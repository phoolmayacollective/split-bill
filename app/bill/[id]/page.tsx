import { redirect } from "next/navigation";

type BillEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BillEntryPage({ params }: BillEntryPageProps) {
  const { id } = await params;
  redirect(`/bill/${id}/name`);
}
