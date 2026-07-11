# Milestone 5: Payer UI — manual bill

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 4  
**Completed:** 2026-07-10

## Goal

Payer can manually add items, review, and get a share link (no encryption yet).

## Tasks

- [x] `app/page.tsx` — landing, "Create a bill"
- [x] `app/create/page.tsx` — manual entry (scan placeholder for phase 3)
- [x] `app/create/manual/page.tsx` — add/edit/remove items, tax, tip, total
- [x] `components/bill-item-editor.tsx`
- [x] POST bill → redirect to share page
- [x] `app/bill/[id]/share/page.tsx` — copy link `/bill/{id}` (no `#password` until phase 2)
- [x] Mobile-first layout

## Maps to payer flow (plan)

1. Create bill (manual)
2. Review & fix items
3. Share link *(payment details added in milestone 8)*

## Acceptance criteria

- Payer completes manual bill creation and copies share link
- No sign-up required

---

## What was done

| Area | Deliverable |
|------|-------------|
| Landing | `app/page.tsx` — unchanged from M1; links to `/create` |
| Create hub | `app/create/page.tsx` — manual entry + scan placeholder (disabled) |
| Manual entry | `app/create/manual/page.tsx` — item list, tax/tip, live totals, sticky submit |
| Item editor | `components/bill-item-editor.tsx` — name, price, qty, remove |
| Totals helpers | `lib/bill-totals.ts` — subtotal/total math + currency formatting |
| Share page | `app/bill/[id]/share/page.tsx` — share URL from `NEXT_PUBLIC_APP_URL` |
| Copy link | `components/copy-share-link.tsx` — clipboard copy with fallback |
| UI primitives | shadcn `Input`, `Label` components |

## How it was done

1. **Create flow** — `/create` offers manual entry (active) and receipt scan (placeholder for M11). `/create/manual` is a client form with `nanoid` item ids.
2. **Item editing** — `BillItemEditor` renders each line item card; payer can add/remove items, set tax/tip; subtotal and total update live via `lib/bill-totals.ts`.
3. **Submit** — form POSTs to `POST /api/bills`, then `router.push` to `/bill/{id}/share` on success; validation errors shown inline.
4. **Share page** — server component verifies bill exists (`getBillById`), builds share URL from env, renders `CopyShareLink` for one-tap copy.
5. **Mobile UX** — `max-w-md` layout, `h-10`/`h-11` touch targets, sticky bottom "Create & share" bar on manual page.
6. **Verified** — `npm run build`, `npm run lint`, live curl create + share page 200.

## Key files

```
lib/bill-totals.ts
components/bill-item-editor.tsx
components/copy-share-link.tsx
components/ui/input.tsx
components/ui/label.tsx
app/create/page.tsx
app/create/manual/page.tsx
app/bill/[id]/share/page.tsx
```

## Updates

- **2026-07-10:** Started M5 — Payer UI manual bill flow.
- **2026-07-10:** Milestone completed. Manual bill creation, POST redirect, and share link copy shipped.
- **2026-07-10:** Pushed to `origin/main` in commit `5c28f5c` (with M4 API routes).
