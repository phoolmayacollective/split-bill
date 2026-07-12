# Milestone 16: Receipt scan (OCR)

**Status:** `pending`  
**Phase:** 3 — OCR  
**Depends on:** Milestone 5

## Goal

Payer uploads/captures receipt → LLM vision → editable line items.

## Tasks

- [ ] `app/create/scan/page.tsx` — camera capture + file upload
- [ ] `POST /api/ocr` — image to vision model → `{ items: [{ name, price, qty }], tax?, tip? }`
- [ ] Pipe result into manual editor for payer review/corrections
- [ ] `OPENAI_API_KEY` (or equivalent) in env
- [ ] Discard image after parse (no long-term storage)
- [ ] Graceful fallback to manual entry on OCR failure

## Acceptance criteria

- Scan → pre-filled items → payer can fix mistakes → continues normal flow
- Never trust extracted totals without human review

## Updates

<!-- dated notes -->
