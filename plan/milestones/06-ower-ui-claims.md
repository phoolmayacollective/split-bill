# Milestone 6: Ower UI — claim & summary

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 4  
**Completed:** 2026-07-10

## Goal

Ower opens link, sets name, claims items, sees amount owed (no payment details yet).

## Tasks

- [x] `app/bill/[id]/page.tsx` — entry / redirect to name step
- [x] `app/bill/[id]/name/page.tsx` — display name input
- [x] `app/bill/[id]/items/page.tsx` — claim items (checkboxes)
- [x] `components/ower-item-picker.tsx` — live running subtotal
- [x] `app/bill/[id]/summary/page.tsx` — subtotal + tax/tip share + total
- [x] Sticky footer with running total on items page
- [x] Submit claims to API

## Maps to ower flow (plan)

1. Open share link
2. Set name
3. Claim items
4. Summary amount *(payment details in milestone 9)*

## Acceptance criteria

- Full ower flow works on mobile without sign-up
- Summary shows correct amount to pay

---

## What was done

| Area | Deliverable |
|------|-------------|
| Entry | `app/bill/[id]/page.tsx` — redirect to `/bill/{id}/name` |
| Name step | `app/bill/[id]/name/page.tsx` + `components/ower-name-form.tsx` |
| Items step | `app/bill/[id]/items/page.tsx` + `components/ower-items-page.tsx` |
| Item picker | `components/ower-item-picker.tsx` — checkboxes + live subtotal preview |
| Summary | `app/bill/[id]/summary/page.tsx` + `components/ower-summary-page.tsx` |
| Session | `lib/ower-session.ts` — `sessionStorage` for ower name per bill |
| UI | `components/ui/checkbox.tsx` — styled native checkbox |

## How it was done

1. **Entry redirect** — `/bill/{id}` server-redirects to `/bill/{id}/name`; all ower routes verify bill exists via `getBillById` + `notFound()`.
2. **Name persistence** — `OwerNameForm` saves trimmed name to `sessionStorage` (`lib/ower-session.ts`); items/summary pages redirect back to name if missing.
3. **Item claiming** — `OwerItemPicker` renders checkbox cards per bill item; live total uses `calculateOwerTotal()` merging other owers' claims with current draft selections.
4. **Sticky footer** — items page mirrors M5 manual create: fixed bottom bar with running total + Continue/View summary CTA.
5. **Submit** — POST only new claims (skips items already claimed by this ower on revisit); navigates to summary on success.
6. **Summary** — fetches `GET /api/bills/{id}/summary`, filters to current ower; shows line items, tax/tip shares, and total.
7. **Verified** — `npm run build`, `npm run lint`, `npm test`; live curl create + pages 200/307 + claims + summary math (e.g. $20 of $30 subtotal → $26 total with tax/tip).

## Key files

```
lib/ower-session.ts
components/ui/checkbox.tsx
components/ower-name-form.tsx
components/ower-item-picker.tsx
components/ower-items-page.tsx
components/ower-summary-page.tsx
app/bill/[id]/page.tsx
app/bill/[id]/name/page.tsx
app/bill/[id]/items/page.tsx
app/bill/[id]/summary/page.tsx
```

## Updates

- **2026-07-10:** Started M6 — Ower UI claim & summary flow.
- **2026-07-10:** Milestone completed. Full ower flow: name → claim items → summary with proportional tax/tip.
- **2026-07-11:** Pushed to `origin/main` in commit `fc0aa9a`.
