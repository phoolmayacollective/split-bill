# Milestone 16: Receipt scan (OCR)

**Status:** `completed`
**Completed:** 2026-07-12  
**Phase:** 3 — OCR  
**Depends on:** Milestone 5

## Goal

Payer uploads/captures a receipt → **browser OCR (Tesseract.js)** extracts text → **Google Gemini text parse** structures line items → editable line items with human review.

Original plan was LLM vision on the image; current approach uses **cheaper two-step OCR → text → structure** so images stay on-device and API cost stays low. The LLM step sends **OCR text only** (not the image) and runs server-side on every scan.

## Tasks

### Browser OCR spike (done)

- [x] `app/create/scan/page.tsx` — camera capture + file upload, OCR progress, review screen
- [x] `lib/ocr/detect-text.ts` — Tesseract.js worker, line extraction, progress callbacks
- [x] `lib/ocr/capture-image.ts` — file preview helpers
- [x] Unit tests — `lib/ocr/parse-receipt-text.test.ts`, `lib/ocr/detect-text.test.ts`
- [x] `/create` hub links to scan (no longer “coming soon”)
- [x] `scripts/dev-phone.sh` + `npm run dev:phone` — LAN URL for phone testing
- [x] Pipe OCR result into bill item editor for payer review/corrections
- [x] Discard image after parse — receipt photo processed in-browser only; not uploaded until bill create
- [x] Graceful fallback to manual entry on OCR failure or zero parsed items

### LLM text parse (Google Gemini — done)

- [x] `lib/ocr/parse-receipt-gemini.ts` — `gemini-flash-latest` via `@google/genai` (override with `GEMINI_MODEL`), structured JSON matching `ParsedReceipt`
- [x] `lib/ocr/normalize-parsed-receipt.ts` — Zod validation for Gemini JSON output
- [x] `POST /api/ocr` — accept OCR **text** (not image) → Gemini → `{ items, tax?, tip? }`
- [x] `GEMINI_API_KEY` in `.env.example` (server-side only; from [Google AI Studio](https://aistudio.google.com/apikey))
- [x] Scan page always calls `/api/ocr` after Tesseract completes — shows “Parsing line items…” progress; API errors fall back to manual entry
- [x] Unit test — `lib/ocr/normalize-parsed-receipt.test.ts`

### Tax handling (done)

- [x] **Tax inclusive / exclusive toggle** on scan review — default **tax inclusive** (Germany/EU: MwSt in item prices); exclusive mode adds parsed tax on top
- [x] `[receipt-ocr]` console logging in `detect-text.ts` for Tesseract debug output

### Remaining for completion

- [x] Initial live test — German receipt scan + Gemini parse works end-to-end (user verified)
- [x] Home page scan entry — `components/home-page-actions.tsx` mirrors `/create` hub (manual + scan)
- [x] User-facing copy — no Tesseract/OCR/Gemini names in product UI; neutral “read receipt” messaging
- [x] Update `demo/COVERAGE.md` — scan feature inventory (automated walkthrough still manual-only)
- [ ] Broader quality evaluation — more receipt types (thermal print, angles, lighting, US tax-exclusive)
- [ ] Add scan scene to Playwright demo / narrated video if demo-worthy

### Explored and rejected

- [x] Capacitor + `@capacitor-community/image-to-text` (iOS Vision) — **not viable for web-only product**; native OCR unavailable in Safari. Spike on branch `feature/ios-vision-ocr`; not pursuing.
- [x] Regex/heuristic-first parse in scan flow — **removed**; `lib/ocr/parse-receipt-text.ts` kept for tests/reference but not used in `/create/scan`.

## Acceptance criteria

- Scan → pre-filled items → payer can fix mistakes → continues normal flow
- Never trust extracted totals without human review

## What was done

| Area | Deliverable |
|------|-------------|
| Scan UI | `app/create/scan/page.tsx` — capture/upload, OCR + LLM progress, receipt preview, raw OCR text + confidence, editable items, **tax inclusive toggle** (default on) |
| OCR engine | `lib/ocr/detect-text.ts` — Tesseract.js v7, `rotateAuto`, line bbox sorting, `[receipt-ocr]` console log |
| LLM parser | `lib/ocr/parse-receipt-gemini.ts` + `POST /api/ocr` — Gemini (`gemini-flash-latest`) structures all OCR text |
| JSON validation | `lib/ocr/normalize-parsed-receipt.ts` — Zod validation for Gemini output |
| Create hub | `app/create/page.tsx` — “Scan a receipt” links to `/create/scan` |
| Home entry | `components/home-page-actions.tsx` — scan + manual CTAs on landing |
| Product copy | Scan/create/home subtext — implementation-neutral; card buttons use `whitespace-normal` / `text-pretty` |
| Phone dev | `scripts/dev-phone.sh`, `npm run dev:phone` — LAN URL for phone testing |
| Deps | `tesseract.js`, `@google/genai` in `package.json` |
| Env | `GEMINI_API_KEY`, optional `GEMINI_MODEL` in `.env.example` |

## How it was done

1. **Browser-first OCR** — Tesseract.js runs on-device; image not sent to server until bill create. Capacitor/iOS Vision rejected (Safari).
2. **LLM-only parse** — After OCR, all text lines POST to `/api/ocr`; Gemini returns structured `{ items, tax?, tip? }`. Regex parser not used in scan flow.
3. **Model selection** — `gemini-2.5-flash-lite` 404s on new AI Studio keys; default `gemini-flash-latest` with optional `GEMINI_MODEL` override.
4. **Tax inclusive default** — Checkbox “Line item prices include tax” (default checked); when inclusive, parsed MwSt is stored but not added to total (fixes German double-tax bug). Exclusive mode prefills tax from parse.
5. **Review-first UX** — Payer confirms/edits items before payment; API errors fall back to manual entry.
6. **Home + copy** — Landing `HomePageActions` adds scan path; user-facing strings avoid vendor/engine names.
7. **Verification** — Live German receipt test passed; `npm test` + `npm run build` pass.

## Key files

```
app/create/scan/page.tsx
app/api/ocr/route.ts
lib/ocr/detect-text.ts
lib/ocr/parse-receipt-gemini.ts
lib/ocr/normalize-parsed-receipt.ts
lib/ocr/capture-image.ts
lib/ocr/tesseract-browser.ts
scripts/dev-phone.sh
```

## LLM provider decision

| Choice | Why |
|--------|-----|
| **Google Gemini `gemini-flash-latest`** | Free tier on AI Studio; structured JSON; works on new keys. `gemini-2.5-flash-lite` 404s — use alias or `GEMINI_MODEL`. |
| **Rejected: vision models** | 10–50× more expensive; image handled by Tesseract on-device |
| **Rejected: regex/heuristic parse in scan flow** | LLM handles messy OCR better; heuristics kept in `parse-receipt-text.ts` for tests only |

**Cost model:** Tesseract $0 on-device; Gemini ~$0 on free tier (~500 tokens/scan).

## Blocked on / next steps

- **Quality gate** — Broader receipt trials (US tax-exclusive, poor lighting, crumpled thermal prints).
- **Demo video** — Playwright walkthrough still uses `/create/manual`; add scan scene when demo-worthy.

## Updates

- **2026-07-12:** **Tax inclusive toggle** on scan review (default on) — fixes German MwSt double-count; exclusive mode adds parsed tax on top.
- **2026-07-12:** Live end-to-end test passed — German receipt → Tesseract → Gemini → review flow works with `GEMINI_API_KEY`.
- **2026-07-12:** `[receipt-ocr]` console logging in `detect-text.ts` for Tesseract debug.
- **2026-07-12:** Switched scan flow to **LLM-only parse** — always POST OCR text to `/api/ocr` after Tesseract.
- **2026-07-12:** Default model `gemini-flash-latest` (`gemini-2.5-flash-lite` 404 on new keys); optional `GEMINI_MODEL`.
- **2026-07-12:** Shipped Gemini parse — `@google/genai` + `POST /api/ocr` + `normalize-parsed-receipt` tests.
- **2026-07-12:** Started M16. Tesseract.js browser OCR spike; Capacitor/iOS Vision rejected for web-only scope.

- **2026-07-12:** Milestone completed — home scan entry, neutral product copy, `demo/COVERAGE.md` updated.
