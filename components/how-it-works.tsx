import { HandCoins, Share2, UtensilsCrossed } from "lucide-react";

import { SectionCard } from "@/components/layout/section-card";

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: "Add items",
    description: "Enter the bill or add line items manually.",
  },
  {
    icon: Share2,
    title: "Share the link",
    description: "Friends open it and pick what they had.",
  },
  {
    icon: HandCoins,
    title: "Get paid",
    description: "They see what they owe and how to pay you.",
  },
];

export function HowItWorks() {
  return (
    <SectionCard title="How it works">
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
              {index + 1}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="flex items-center gap-1.5 font-medium">
                <step.icon className="text-primary size-4" aria-hidden />
                {step.title}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
