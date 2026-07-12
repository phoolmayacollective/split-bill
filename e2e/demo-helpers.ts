import type { BrowserContext, Locator, Page } from "@playwright/test";
import path from "path";

export type DemoScene = {
  id: string;
  persona: string;
  text: string;
  bufferMs: number;
};

export type AudioManifestEntry = {
  id: string;
  file: string;
  durationMs: number;
  bufferMs: number;
};

const ROOT = process.cwd();
const AUDIO_MANIFEST_PATH = path.join(ROOT, "demo/output/audio/manifest.json");

export const DEMO_PERSONAS = {
  overview: "Product demo",
  payer: "Payer · Alex",
  ower: "Ower · Sam",
  owerJordan: "Ower · Jordan",
  restaurant: "Restaurant · Alex",
} as const;

/** Clear stored ower name so a second person can pick from the roster. */
export async function clearOwerSession(
  page: Page,
  billId: string,
): Promise<void> {
  await page.evaluate((id) => {
    sessionStorage.removeItem(`split-bill:ower:${id}`);
  }, billId);
}

/** Append `demo_persona` query param; preserves URL hash (e.g. `#password`). */
export function withDemoPersona(path: string, persona: string): string {
  const hashIndex = path.indexOf("#");
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);

  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}demo_persona=${encodeURIComponent(persona)}${hash}`;
}

export const SCENE_PAUSE_MS = 3000;
export const TYPE_DELAY_MS = 100;
export const CLICK_DELAY_MS = 500;
export const ACTION_GAP_MS = 800;
export const CURSOR_MOVE_MS = 400;

const DEMO_VISUALS_INIT = () => {
  const win = window as unknown as {
    __demoVisualsReady?: boolean;
    __demoMoveCursor?: (x: number, y: number) => void;
    __demoClickEffect?: (x: number, y: number) => void;
  };

  if (win.__demoVisualsReady) {
    return;
  }
  win.__demoVisualsReady = true;

  const ensureCursor = () => {
    if (document.getElementById("demo-cursor")) {
      return;
    }

    if (!document.getElementById("demo-cursor-styles")) {
      const style = document.createElement("style");
      style.id = "demo-cursor-styles";
      style.textContent = `
    #demo-cursor {
      position: fixed;
      width: 28px;
      height: 28px;
      border: 3px solid #f97316;
      border-radius: 50%;
      background: rgba(249, 115, 22, 0.3);
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: left 0.4s ease-out, top 0.4s ease-out, transform 0.15s ease-out;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    #demo-cursor.clicking {
      transform: translate(-50%, -50%) scale(0.75);
      background: rgba(249, 115, 22, 0.6);
      border-color: #ea580c;
    }
    .demo-click-ripple {
      position: fixed;
      width: 56px;
      height: 56px;
      border: 4px solid #f97316;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%) scale(0.2);
      animation: demo-ripple 0.7s ease-out forwards;
    }
    @keyframes demo-ripple {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.2);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.8);
      }
    }
    .demo-typing-field {
      outline: 3px solid #f97316 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.45) !important;
      transition: outline 0.2s ease, box-shadow 0.2s ease;
    }
  `;
      document.head.appendChild(style);
    }

    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.style.left = "50%";
    cursor.style.top = "40%";
    document.body.appendChild(cursor);
  };

  win.__demoMoveCursor = (x: number, y: number) => {
    ensureCursor();
    const cursor = document.getElementById("demo-cursor");
    if (!cursor) {
      return;
    }
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  };

  win.__demoClickEffect = (x: number, y: number) => {
    ensureCursor();
    const cursor = document.getElementById("demo-cursor");
    if (!cursor) {
      return;
    }

    cursor.classList.add("clicking");
    const ripple = document.createElement("div");
    ripple.className = "demo-click-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
    window.setTimeout(() => cursor.classList.remove("clicking"), 250);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureCursor);
  } else {
    ensureCursor();
  }
};

export async function setupDemoVisuals(context: BrowserContext): Promise<void> {
  await context.addInitScript(DEMO_VISUALS_INIT);
}

async function moveCursorToLocator(
  page: Page,
  locator: Locator,
): Promise<{ x: number; y: number }> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Demo cursor target is not visible");
  }

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 20 });
  await page.evaluate(
    ([px, py]) => {
      (
        window as unknown as { __demoMoveCursor: (x: number, y: number) => void }
      ).__demoMoveCursor(px, py);
    },
    [x, y],
  );
  await page.waitForTimeout(CURSOR_MOVE_MS);
  return { x, y };
}

export async function demoClick(page: Page, locator: Locator): Promise<void> {
  const { x, y } = await moveCursorToLocator(page, locator);
  await page.evaluate(
    ([px, py]) => {
      (
        window as unknown as { __demoClickEffect: (x: number, y: number) => void }
      ).__demoClickEffect(px, py);
    },
    [x, y],
  );
  await page.waitForTimeout(CLICK_DELAY_MS);
  await locator.click();
  await page.waitForTimeout(ACTION_GAP_MS);
}

export async function demoType(
  page: Page,
  locator: Locator,
  text: string,
): Promise<void> {
  await moveCursorToLocator(page, locator);
  await locator.click();
  await locator.evaluate((el) => el.classList.add("demo-typing-field"));
  await page.waitForTimeout(300);
  await locator.clear();
  await page.waitForTimeout(200);

  for (const char of text) {
    await locator.pressSequentially(char, { delay: TYPE_DELAY_MS });
  }

  await page.waitForTimeout(500);
  await locator.evaluate((el) => el.classList.remove("demo-typing-field"));
  await page.waitForTimeout(ACTION_GAP_MS);
}

export async function demoGoto(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForTimeout(ACTION_GAP_MS);
}

export async function pauseForDemo(page: Page): Promise<void> {
  await page.waitForTimeout(SCENE_PAUSE_MS);
}

export async function loadAudioManifest(): Promise<AudioManifestEntry[] | null> {
  if (process.env.DEMO_USE_AUDIO_TIMING !== "1") {
    return null;
  }

  const fs = await import("fs");
  if (!fs.existsSync(AUDIO_MANIFEST_PATH)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(AUDIO_MANIFEST_PATH, "utf8"),
  ) as AudioManifestEntry[];
}

export async function pauseForScene(
  page: Page,
  sceneId: string,
  audioManifest: AudioManifestEntry[] | null,
): Promise<void> {
  const entry = audioManifest?.find((item) => item.id === sceneId);
  const pauseMs = entry
    ? entry.durationMs + (entry.bufferMs ?? 500)
    : SCENE_PAUSE_MS;

  await page.waitForTimeout(pauseMs);
}
