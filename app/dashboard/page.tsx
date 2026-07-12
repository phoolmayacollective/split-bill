import type { Metadata } from "next";

import { PayerDashboardPage } from "@/components/payer-dashboard-page";

export const metadata: Metadata = {
  title: "Your bills — Split Bill",
  description: "See bills you've saved and manage your circle.",
};

export default function DashboardRoute() {
  return <PayerDashboardPage />;
}
