"use client";

import { useSearchParams } from "next/navigation";

import { DEMO_PERSONA_PARAM, isDemoModeEnabled } from "@/lib/demo-mode";

export function DemoPersonaBanner() {
  const searchParams = useSearchParams();
  const persona = searchParams.get(DEMO_PERSONA_PARAM)?.trim();

  if (!isDemoModeEnabled() || !persona) {
    return null;
  }

  return (
    <div
      data-testid="demo-persona-banner"
      className="border-amber-500/35 bg-amber-400/20 text-amber-950 sticky top-0 z-50 border-b px-4 py-2 text-center text-sm font-medium backdrop-blur-sm"
    >
      <span className="text-amber-900/70">Demo · </span>
      {persona}
    </div>
  );
}
