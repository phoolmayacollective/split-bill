# Milestone 6: Ower UI — claim & summary

**Status:** `pending`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 4

## Goal

Ower opens link, sets name, claims items, sees amount owed (no payment details yet).

## Tasks

- [ ] `app/bill/[id]/page.tsx` — entry / redirect to name step
- [ ] `app/bill/[id]/name/page.tsx` — display name input
- [ ] `app/bill/[id]/items/page.tsx` — claim items (checkboxes)
- [ ] `components/ower-item-picker.tsx` — live running subtotal
- [ ] `app/bill/[id]/summary/page.tsx` — subtotal + tax/tip share + total
- [ ] Sticky footer with running total on items page
- [ ] Submit claims to API

## Maps to ower flow (plan)

1. Open share link
2. Set name
3. Claim items
4. Summary amount *(payment details in milestone 9)*

## Acceptance criteria

- Full ower flow works on mobile without sign-up
- Summary shows correct amount to pay

## Updates

<!-- dated notes -->
