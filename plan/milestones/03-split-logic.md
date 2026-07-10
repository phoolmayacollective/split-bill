# Milestone 3: Split calculation logic

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 1  
**Completed:** 2026-07-10

## Goal

Pure functions: claim-based splitting with proportional tax/tip.

## Tasks

- [x] `lib/split.ts`
- [x] Item claimed by N people → each owes `price / N` (or weighted by `share`)
- [x] Ower subtotal from claimed items
- [x] Tax/tip allocated proportionally to claimed subtotal
- [x] Rounding to 2 decimals
- [x] Unit tests: single ower, shared item, uneven tax split

## Acceptance criteria

- Given items + claims, returns correct per-ower totals
- Ready for API and UI consumption

---

## What was done

| Area | Deliverable |
|------|-------------|
| Split engine | `lib/split.ts` — `calculateSplits()` and `calculateOwerTotal()` |
| Shared items | Weighted by `share`; equal `share: 1` splits evenly |
| Tax/tip | Scaled to claimed portion of bill subtotal, then split among owers |
| Rounding | Per-line and per-ower amounts rounded to 2 decimals; remainder on last ower |
| Tests | `lib/split.test.ts` — 6 cases (single ower, shared item, proportional tax, weighted shares, unclaimed items, preview helper) |
| Tooling | `npm test` script + `tsx` dev dependency |

## How it was done

1. **`calculateSplits({ items, totals, claims })`** — groups claims by item, computes each ower's line amounts as `(itemCost × share) / totalShare`, sums subtotals.
2. **Tax/tip pool** — `pool = tax × (claimedSubtotal / billSubtotal)` so unclaimed items don't inflate ower tax/tip; pool distributed among owers by their subtotal weights.
3. **`calculateOwerTotal()`** — thin wrapper for live UI preview of one ower's breakdown.
4. **Tests** — Node built-in test runner via `tsx`; all 6 pass.

## Key files

```
lib/split.ts        # Pure split logic (no DB dependency)
lib/split.test.ts   # Unit tests
package.json        # "test" script
```

## Updates

- **2026-07-10:** Milestone completed. Split logic + tests shipped; tax/tip fixed to scale against full bill subtotal (unclaimed items excluded from tax/tip pool).
