import type { Metadata } from "next";

import { DalbhatBillForm } from "@/components/restaurant/dalbhat-bill-form";

export const metadata: Metadata = {
  title: "Dal Bhat — Split Bill",
  description: "Create a split bill from the Dal Bhat menu.",
};

export default function DalbhatRestaurantPage() {
  return <DalbhatBillForm />;
}
