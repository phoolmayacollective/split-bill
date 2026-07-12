/** True when the app is started with demo overlays enabled (e.g. `npm run dev:demo`). */
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export const DEMO_PERSONA_PARAM = "demo_persona";
