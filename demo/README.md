# Demo video output

Playwright writes screen recordings and test artifacts here. Not committed to git.

## Run a demo video

```bash
# Requires .env.local with Supabase credentials (see ../.env.example)
npm install
npx playwright install chromium

npm run demo:video
```

This builds the app with `NEXT_PUBLIC_DEMO_MODE=true`, starts it on port **3001** (won't conflict with `npm run dev` on 3000), records the walkthrough, then stops the server.

Videos are saved as:
- `demo/output/videos/demo-walkthrough.webm` (Playwright recording)
- `demo/output/demo-walkthrough.mp4` (auto-converted via ffmpeg, if installed)

The walkthrough uses one browser session (payer → owers → payer → restaurant) so the recording is continuous. Interactions are slowed for readability, with an on-screen cursor, click ripples, and highlighted fields while typing.

For interactive preview only:

```bash
npm run dev:demo
# Open http://localhost:3001/?demo_persona=Payer%20·%20Ramey
```

## Demo-only persona banner

The amber banner at the top of the screen appears **only** when:

1. The app is started with `NEXT_PUBLIC_DEMO_MODE=true` (`npm run dev:demo`, `npm run demo:video`, or `npm run build:demo`)
2. The URL includes `?demo_persona=...` (set automatically by the Playwright spec)

Normal `npm run dev` and production builds never show the banner.

## Narrated demo (WaveNet + ffmpeg)

Requires **ffmpeg** and **ffprobe** on your PATH, plus Google Cloud Text-to-Speech credentials.

1. Enable [Cloud Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com) in a GCP project
2. Create a service account with TTS access and download the JSON key
3. Add to `.env.local`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Then run the full narrated pipeline:

```bash
npm run demo:video:narrated
```

This runs three steps:

1. **`demo:narration`** — WaveNet TTS (`en-US-Wavenet-D`) for each scene in `demo/scenes.json` → `demo/output/audio/*.mp3` + `manifest.json`
2. **Playwright recording** — pauses driven by audio durations (`DEMO_USE_AUDIO_TIMING=1`) → `demo/output/videos/demo-walkthrough.webm`
3. **`demo:composite`** — concatenates audio clips and muxes with video → `demo/output/final-demo.mp4`

Individual steps:

```bash
npm run demo:narration   # TTS only (fails with setup instructions if credentials missing)
npm run demo:video       # Silent recording only
npm run demo:composite   # Mux existing video + audio
```

### Personas used in the walkthrough

| Scene | `demo_persona` value |
|-------|----------------------|
| Landing | `Product demo` |
| Payer flows | `Payer · Ramey` |
| Shyamey (ower) | `Ower · Shyamey` |
| Harkey (ower) | `Ower · Harkey` |
| Dal Bhat menu | `Restaurant · Ramey` |

See `demo/COVERAGE.md` for the full 13-scene inventory.

### Manual testing

```bash
npm run dev:demo
# Open http://localhost:3001/?demo_persona=Payer%20·%20Ramey
```
