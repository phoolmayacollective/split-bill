import { CaptureBillPassword } from "@/components/capture-bill-password";

type BillLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function BillLayout({ children, params }: BillLayoutProps) {
  const { id } = await params;

  return (
    <>
      <CaptureBillPassword billId={id} />
      {children}
    </>
  );
}
