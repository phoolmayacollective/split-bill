# Milestone 3: Split calculation logic

**Status:** `pending`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 1

## Goal

Pure functions: claim-based splitting with proportional tax/tip.

## Tasks

- [ ] `lib/split.ts`
- [ ] Item claimed by N people → each owes `price / N` (or weighted by `share`)
- [ ] Ower subtotal from claimed items
- [ ] Tax/tip allocated proportionally to claimed subtotal
- [ ] Rounding to 2 decimals
- [ ] Unit tests: single ower, shared item, uneven tax split

## Acceptance criteria

- Given items + claims, returns correct per-ower totals
- Ready for API and UI consumption

## Updates

<!-- dated notes -->
