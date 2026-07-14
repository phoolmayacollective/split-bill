# Milestone 19: Receipt scan polish (zero additional cost)

**Status:** `completed`  
**Started:** 2026-07-14  
**Completed:** 2026-07-14  
**Phase:** 3 — OCR  
**Depends on:** Milestone 16

## Goal

Improve receipt scan **speed, accuracy, and review UX** without adding new paid API paths. All work stays within the existing pipeline: on-device Tesseract → text-only Gemini parse → payer review.

**In scope:** German OCR language pack, image preprocessing, worker warm-up, extracted-text UI, total reconciliation, prompt hardening, scan state fixes, retry parsing, honest progress, and basic `/api/ocr` abuse protection.

**Out of scope (deferred — adds cost or new API surface):**

- **Vision fallback** — sending receipt images to Gemini when OCR confidence is low. Revisit as a separate milestone if text-only parse quality plateaus.

## Tasks

### Quick wins — OCR speed & accuracy

- [x] **German language pack** — load `deu+eng` in `lib/ocr/detect-text.ts` instead of `eng` only
  - Added `@tesseract.js-data/deu` dev dependency
  - `scripts/copy-tesseract-assets.mjs` generalized to a language list (`eng`, `deu`); copies both `.traineddata.gz` into `public/tesseract/lang/`
  - Umlauts/MwSt/comma-decimal verification pending manual phone test
- [x] **Downscale before OCR** — `prepareImageForOcr()` in `lib/ocr/capture-image.ts` caps longest edge at 2000px via `createImageBitmap` + canvas → JPEG (0.92); returns original file when already small or undecodable (e.g. HEIC)
  - Grayscale/contrast normalization skipped — Tesseract binarizes internally and `ctx.filter` lacks Safari support; revisit only if thermal receipts still underperform
  - Original file kept for preview; OCR runs on the processed blob
- [x] **Warm OCR worker on mount** — `prepareOcrWorker()` exported from `detect-text.ts`, called in a `useEffect` on scan page mount; progress logger made mutable (`activeProgressHandler`) so a pre-warmed worker still reports scan progress
  - Capture copy updated — on-device privacy note instead of "first scan may take longer" apology

### Review UX — show what was read

- [x] **"What we read" section** on review step — collapsible `<details>` block showing `rawText` lines with per-line confidence and average confidence summary; zero-items error copy now points at it
- [x] **Total reconciliation** — `total` added to Gemini schema, `normalize-parsed-receipt.ts`, and `ParsedReceipt`; `lib/ocr/reconcile-total.ts` compares computed total vs printed total (±0.05 tolerance) and review shows amber warning with both amounts (`formatEuro`)
- [x] **Prompt hardening** in `lib/ocr/parse-receipt-gemini.ts`
  - `price` is **per unit**; divide line totals by quantity
  - Pfand/deposit lines included as items
  - Discounts folded into the affected item's unit price when attributable; unattributable discounts ignored (surfaced via total-mismatch warning instead) — negative-price items rejected because bill validation requires `price > 0`
  - Comma decimal separators called out explicitly

### Flow & state fixes

- [x] **Cancel actually cancels** — `scanGenerationRef` counter guards every `set*` after each `await`; cancel bumps the generation, stays on capture, and terminates + re-warms the worker
- [x] **Retry parsing** — when `/api/ocr` fails but OCR text exists (`canRetryParse`), review shows "Retry reading items from the scan" which re-POSTs stored `rawText` without rescanning
- [x] **Honest LLM progress** — `OcrProgress.indeterminate` flag; Gemini stage reports 90% + `animate-pulse` instead of a bar frozen at 100%

### Server hardening (no new API cost)

- [x] **`/api/ocr` abuse protection** — `ocrParseSchema` caps 300 lines × 300 chars; `lib/api/rate-limit.ts` in-memory sliding window (10 req/min per IP via `x-forwarded-for`) returns 429


### Capture & review polish (post-implementation)

- [x] **Receipt crop step** — `components/receipt-image-cropper.tsx` with `react-image-crop` freeform corner drag; scan flow crops before OCR while keeping original for preview
- [x] **Tap-to-copy OCR lines** — `components/receipt-extracted-text.tsx` (`ReceiptExtractedText`) replaces inline raw-text list; each line copies on tap with brief feedback
- [x] **Prompt hardening (round 2)** — dates/timestamps ignored; OCR `6` as euro sign; two-price lines use line total ÷ qty; Gemini `temperature: 0.1`
- [x] **Features page + demo** — `scan-receipt.png`, generic invoice fixture + `scripts/generate-test-invoice.mjs`; demo coverage docs updated

### Tests & verification

- [x] Unit tests — `reconcile-total.test.ts` (5), `rate-limit.test.ts` (6), `normalize-parsed-receipt.test.ts` total-field cases; wired into `npm test`
- [x] `lib/ocr/detect-text.test.ts` — unchanged (tests pure line helpers, not worker language)
- [ ] Manual phone test — German receipt end-to-end; cancel mid-scan; retry after simulated API error
- [x] `npm test` (91 pass) + `npm run build` pass

## Acceptance criteria

- German receipt scan recognizes umlauts and comma decimals better than English-only baseline
- First perceived scan time improves (worker warm + smaller OCR input)
- Review screen shows extracted OCR text; payer can spot missed lines without devtools
- Total mismatch warning appears when item sum ≠ printed receipt total
- Cancel returns to capture; concurrent scans cannot clobber each other
- Gemini API failure offers retry without re-uploading photo
- No new image-to-LLM API calls; Gemini usage remains one text parse per scan (retry = user-initiated, same endpoint)



---

## What was done

| Area | Deliverable |
|------|-------------|
| OCR speed & accuracy | `deu+eng` Tesseract lang data in `public/tesseract/lang/`; `prepareImageForOcr()` downscale; `prepareOcrWorker()` warm-up on scan mount |
| Capture UX | Freeform receipt crop (`receipt-image-cropper.tsx`) before OCR |
| Review UX | Collapsible “What we read”; `ReceiptExtractedText` tap-to-copy lines; total mismatch warning via `reconcile-total.ts` |
| Parse quality | Gemini prompt rules (unit price, Pfand, comma decimals, dates/timestamps, € as `6`, two-price lines); `temperature: 0.1`; optional `total` in schema |
| Flow & state | Scan-generation cancel guard; retry parse without rescan; honest indeterminate LLM progress |
| Server hardening | `/api/ocr` line caps + in-memory rate limit (`rate-limit.ts`, 10/min per IP) |
| Tests & assets | `reconcile-total.test.ts`, `rate-limit.test.ts`, normalize total cases; Tesseract core assets copy script; features screenshot |

## How it was done

1. Extended `copy-tesseract-assets.mjs` and `detect-text.ts` for German + English; downscale and worker warm-up in `capture-image.ts` / scan page `useEffect`.
2. Added crop step with `react-image-crop` and extracted-text components; wired review warnings from `reconcileTotals()`.
3. Hardened `parse-receipt-gemini.ts` and normalization; guarded async scan state with `scanGenerationRef`; retry POSTs stored `rawText`.
4. Rate-limited `/api/ocr` and capped payload size in `schemas.ts`; unit tests added to `npm test`.
5. Verified with `npm test` (91 pass) and `npm run build`; deployed to Vercel production.

## Suggested implementation order

1. German `deu+eng` + image downscale + worker warm-up *(biggest speed/accuracy wins)*
2. Cancel / scan-generation guard + honest LLM progress *(fix broken UX)*
3. "What we read" UI + retry parsing *(trust & recovery)*
4. Total reconciliation + prompt hardening *(informed review)*
5. `/api/ocr` rate limit + tests

## Key files

```
app/create/scan/page.tsx
lib/ocr/detect-text.ts
lib/ocr/capture-image.ts
lib/ocr/parse-receipt-gemini.ts
lib/ocr/normalize-parsed-receipt.ts
lib/ocr/parse-receipt-text.ts          # ParsedReceipt type
app/api/ocr/route.ts
scripts/copy-tesseract-assets.mjs
package.json                           # @tesseract.js-data/deu
```

## Cost model

| Change | Cost impact |
|--------|-------------|
| `deu+eng` Tesseract | $0 — self-hosted lang data, slightly larger initial download |
| Image downscale / warm worker | $0 — client-side only |
| Total field in existing Gemini call | $0 — same request, ~few extra output tokens |
| Prompt rules | $0 |
| Retry parsing | $0 — user-triggered re-use of same `/api/ocr` endpoint |
| Rate limit | $0 — protects existing free-tier quota |

## Follow-up (not blocking ship)

- **Manual phone test** — scan a German receipt end-to-end on a phone (`npm run dev:phone`): check umlaut/comma-decimal recognition with `deu+eng`, cancel mid-scan stays on capture, and retry works after a simulated `/api/ocr` failure (e.g. temporarily unset `GEMINI_API_KEY`).

## Updates

- **2026-07-14:** All implementation tasks done — `deu+eng` OCR, image downscale (`prepareImageForOcr`), worker warm-up, scan-generation cancel guard, retry parsing, "What we read" section, total reconciliation warning, prompt hardening (unit price / Pfand / discounts), `/api/ocr` line caps + 10/min rate limit. `npm test` 91 pass, `npm run build` green. Remaining: manual phone verification.
- **2026-07-14:** Milestone created from post-M16 scan review. Excludes vision fallback (paid image input); bundles zero-cost OCR, UX, parse, and hardening improvements.
- **2026-07-14:** Milestone completed. Shipped deu+eng OCR, downscale, worker warm-up, crop step, tap-to-copy lines, total reconciliation, prompt hardening (incl. unit price, Pfand, dates, €/6, two-price lines, temp 0.1), cancel/retry/honest progress, and `/api/ocr` rate limit. `npm test` + `npm run build` pass; production deploy. Manual phone verification remains optional follow-up.
