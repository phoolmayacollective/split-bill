# Milestone 16: Receipt scan (OCR)

**Status:** `in_progress`  
**Phase:** 3 — OCR  
**Depends on:** Milestone 5

## Goal

Payer uploads/captures a receipt → **browser OCR (Tesseract.js)** extracts text → heuristic parse (future: LLM on text) → editable line items with human review.

Original plan was LLM vision on the image; current spike uses **cheaper two-step OCR → text → structure** so images stay on-device and API cost stays low.

## Tasks

### Browser OCR spike (done)

- [x] `app/create/scan/page.tsx` — camera capture + file upload, OCR progress, review screen
- [x] `lib/ocr/detect-text.ts` — Tesseract.js worker, line extraction, progress callbacks
- [x] `lib/ocr/parse-receipt-text.ts` — heuristic `{ name, price, qty }` + tax/tip from OCR lines
- [x] `lib/ocr/capture-image.ts` — file preview helpers
- [x] Unit tests — `lib/ocr/parse-receipt-text.test.ts`, `lib/ocr/detect-text.test.ts`
- [x] `/create` hub links to scan (no longer “coming soon”)
- [x] `scripts/dev-phone.sh` + `npm run dev:phone` — LAN URL for phone testing
- [x] Pipe OCR result into bill item editor for payer review/corrections
- [x] Discard image after parse — receipt photo processed in-browser only; not uploaded until bill create
- [x] Graceful fallback to manual entry on OCR failure or zero parsed items

### Remaining for completion

- [ ] Evaluate Tesseract quality on real receipt photos (mobile + desktop)
- [ ] `POST /api/ocr` — accept OCR **text** (not image) → LLM → `{ items, tax?, tip? }`
- [ ] `OPENAI_API_KEY` (or equivalent) in env for text-structuring step
- [ ] Hybrid: heuristic parse first, LLM only when parser finds no items
- [ ] Update `demo/COVERAGE.md` and demo video if scan is demo-worthy

### Explored and rejected

- [x] Capacitor + `@capacitor-community/image-to-text` (iOS Vision) — **not viable for web-only product**; native OCR unavailable in Safari. Spike on branch `feature/ios-vision-ocr`; not pursuing.

## Acceptance criteria

- Scan → pre-filled items → payer can fix mistakes → continues normal flow
- Never trust extracted totals without human review

## Current attempt

### What’s in place

| Area | Deliverable |
|------|-------------|
| Scan UI | `app/create/scan/page.tsx` — capture/upload, progress bar, receipt preview, raw OCR text + confidence, editable items |
| OCR engine | `lib/ocr/detect-text.ts` — Tesseract.js v7, English, `rotateAuto`, line bbox sorting |
| Parser | `lib/ocr/parse-receipt-text.ts` — price-suffix lines, qty (`2 x Item`), tax/tip keywords |
| Create hub | `app/create/page.tsx` — “Scan a receipt” links to `/create/scan` |
| Phone dev | `scripts/dev-phone.sh`, `npm run dev:phone` — prints LAN IP for testing on phone |
| Deps | `tesseract.js` in `package.json` |

### How it was built

1. **Approach shift** — Evaluated iOS native Vision via Capacitor; dropped because the product is browser-first (Safari cannot call Vision). Chose **Tesseract.js** for $0 client-side OCR.
2. **OCR pipeline** — Dynamic-import Tesseract worker; `recognize()` with `blocks: true`; flatten `blocks → paragraphs → lines`; fall back to plain `text` split on newlines.
3. **Review-first UX** — Scan page shows extracted text with per-line confidence, parsed items in `BillItemEditor`, and continues to payment only after payer confirms (same flow as manual create).
4. **Mobile testing** — `dev-phone.sh` detects Mac LAN IP (`en0`/`en1`), binds `0.0.0.0`, copies phone URL to clipboard; fixed macOS `$HOSTNAME` collision by using `BIND_HOST`.
5. **Verification** — `npm test` (parser + line-mapping tests), `npm run build` pass.

### Key files

```
app/create/scan/page.tsx
app/create/page.tsx
lib/ocr/detect-text.ts
lib/ocr/parse-receipt-text.ts
lib/ocr/capture-image.ts
scripts/dev-phone.sh
```

### Blocked on / next decision

- **Quality gate** — Need real receipt trials on phone (thermal print, angles, lighting). If Tesseract text is good enough → add cheap LLM text parse (`POST /api/ocr`). If not → consider cloud OCR API or LLM vision fallback.
- **LLM step** — Not implemented yet; heuristic parser alone will miss messy receipts.

## Updates

- **2026-07-12:** Started M16. Tesseract.js browser OCR spike on `feature/ios-vision-ocr` branch; Capacitor/iOS Vision explored and rejected for web-only scope. Scan UI + heuristic parser + `dev:phone` script shipped for evaluation.
