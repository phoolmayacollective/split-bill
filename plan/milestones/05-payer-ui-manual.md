# Milestone 5: Payer UI — manual bill

**Status:** `pending`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 4

## Goal

Payer can manually add items, review, and get a share link (no encryption yet).

## Tasks

- [ ] `app/page.tsx` — landing, "Create a bill"
- [ ] `app/create/page.tsx` — manual entry (scan placeholder for phase 3)
- [ ] `app/create/manual/page.tsx` — add/edit/remove items, tax, tip, total
- [ ] `components/bill-item-editor.tsx`
- [ ] POST bill → redirect to share page
- [ ] `app/bill/[id]/share/page.tsx` — copy link `/bill/{id}` (no `#password` until phase 2)
- [ ] Mobile-first layout

## Maps to payer flow (plan)

1. Create bill (manual)
2. Review & fix items
3. Share link *(payment details added in milestone 8)*

## Acceptance criteria

- Payer completes manual bill creation and copies share link
- No sign-up required

## Updates

<!-- dated notes -->
