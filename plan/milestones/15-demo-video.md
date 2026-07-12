# Milestone 15: Automated demo video

**Status:** `in_progress`  
**Phase:** 6 — Demo tooling  
**Depends on:** Milestone 6, 9, 10

## Goal

One command produces a product walkthrough video of all major flows (payer create → payment → share → ower claim → settlement), with optional Google Cloud WaveNet narration and persona labels visible only during recording.

## Tasks

### Phase A — Silent demo

- [x] Playwright walkthrough spec — `e2e/demo-walkthrough.spec.ts` (13 scenes, single continuous session)
- [x] Demo runner — `scripts/run-demo-video.mjs` (`build:demo` → `start:demo` :3001 → Playwright → stop)
- [x] Demo-only persona banner — `components/demo-persona-banner.tsx` gated by `NEXT_PUBLIC_DEMO_MODE` + `?demo_persona=`
- [x] npm scripts — `demo:video`, `dev:demo`, `build:demo`, `start:demo`
- [x] Output docs — `demo/README.md`; `demo/output/` gitignored
- [x] Playwright config — `playwright.config.ts` (mobile viewport, video on)
- [x] Demo visuals — on-screen cursor, click ripples, highlighted typing in `e2e/demo-helpers.ts`

### Phase B — WaveNet narration

- [x] GCP setup documented — `.env.example` (`GOOGLE_APPLICATION_CREDENTIALS`)
- [x] Scene manifest — `demo/scenes.json` (13 scenes: id, persona, text, bufferMs)
- [x] TTS script — `scripts/generate-narration.mjs` using `@google-cloud/text-to-speech`, voice `en-US-Wavenet-D`
- [x] Audio manifest — `demo/output/audio/manifest.json` with per-scene `durationMs` (ffprobe)
- [x] Audio-driven pauses — spec reads manifest via `pauseForScene()` in `e2e/demo-helpers.ts`
- [x] ffmpeg composite — `scripts/composite-demo.mjs` → `demo/output/final-demo.mp4`
- [x] Narrated orchestrator — `scripts/run-demo-narrated.mjs`
- [x] npm scripts — `demo:narration`, `demo:composite`, `demo:video:narrated`

## Acceptance criteria

- [x] `npm run demo:video` produces silent `.webm` covering payer → owers → settlement → Dal Bhat menu
- [x] Demo persona banner appears only with `NEXT_PUBLIC_DEMO_MODE=true` + `?demo_persona=`
- [ ] `npm run demo:video:narrated` produces `final-demo.mp4` with WaveNet voiceover (requires GCP credentials)
- [x] No GCP credentials required for silent path; narrated path fails with clear setup message if missing
- [x] Normal `npm run dev` / production builds never show demo banner

## Blocked on user

GCP service account JSON for WaveNet TTS — set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`. See `demo/README.md`.

---

## What was done (partial — 2026-07-12)

| Area | Deliverable |
|------|-------------|
| Playwright spec | `e2e/demo-walkthrough.spec.ts` — 13 scenes, single browser session, demo cursor/typing |
| Helpers | `e2e/demo-helpers.ts` — personas, `withDemoPersona()`, `pauseForScene()`, demo visuals |
| Runner | `scripts/run-demo-video.mjs` — build+start on :3001, finalize to `demo-walkthrough.webm` |
| Demo banner | `components/demo-persona-banner.tsx` + `lib/demo-mode.ts`; wired in `app/layout.tsx` |
| Config | `playwright.config.ts`, `@playwright/test` devDep |
| Docs | `demo/README.md` |

## How it was done (partial)

1. Chose Playwright-in-repo over Cloud Agent (zero tokens per re-run, deterministic).
2. Added `NEXT_PUBLIC_DEMO_MODE` env gate so banner never appears in production.
3. Used `build:demo` + `start:demo` on port 3001 to avoid Next.js single-dev-server lock.
4. Single browser context for continuous recording; `demo_persona` query param per scene.
5. Verified with `npm run demo:video` — test passes, `.webm` saved.

## Updates

- **2026-07-12:** Extended walkthrough to 13 scenes — share link copy, split-with-N, second ower, payer mark paid, decrypted payment copy, Dal Bhat menu. Added `Ower · Harkey` and `Restaurant · Ramey` personas.
- **2026-07-12:** Renamed demo personas to Nepali-themed fixtures (Ramey, Shyamey, Harkey); manual-create bill item is Momo (10 pc); Dal Bhat scene searches "momo".
- **2026-07-12:** Started M15. Silent Playwright pipeline + demo persona banner shipped. WaveNet narration pipeline added (Phase B).
