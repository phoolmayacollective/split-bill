# Milestone 11: Shared-item & tax/tip polish

**Status:** `completed`  
**Completed:** 2026-07-12  
**Phase:** 4 — Polish  
**Depends on:** Milestone 6

## Goal

Refine splitting UX: multiple claimants per item, clear tax/tip breakdown.

## Tasks

- [x] UI shows when an item is shared (e.g. "split 2 ways")
- [x] Weighted `share` support if needed (fraction per claimant)
- [x] Summary breakdown: items → subtotal → tax share → tip share → total
- [x] Show other claimants on same item (optional, read-only)
- [x] Edge cases: unclaimed items, single claimant

## Acceptance criteria

- Two owers claiming same item see correct split
- Tax/tip proportional allocation is visible and understandable

---

## What was done

| Area | Deliverable |
|------|-------------|
| Unit model | `lib/bill-units.ts` — expand multi-qty lines into `BillUnit[]` (`parentId::unitIndex`); legacy parent claims normalized to `::0` |
| Claim drafts | `lib/claim-units.ts` — per-unit `{ enabled, splitCount }`; first claimant sets N; pool validation; fraction `1/N` stored as `share` |
| Split math | `lib/split.ts` — `amount = unit.price * share`; proportional tax/tip on claimed subtotal |
| Progress | `lib/item-progress.ts` — per-unit `percent_claimed` / `percent_paid`; payer sees each unit as its own row |
| Ower UI | `OwerItemPicker` — checkbox + “Split with N people” stepper; pool status (“1 of 3 spots claimed”) |
| Payer UI | `ItemProgressBar` — fractional segments + unclaimed portion; `progressLabel()` e.g. `33% claimed · 0% paid` |
| API | `POST /api/bills/[id]/claims` validates unit IDs via `getUnitIds()` |
| Tests | `lib/bill-units.test.ts`, `lib/claim-units.test.ts`; updated split, progress, and split-display tests (41 total) |

## How it was done

1. Replaced parent-item qty claims with **unit rows** so “4 pizzas” renders as four separate lines and each can be claimed or split independently.
2. Stored shares as fractions (`1/splitCount`); first claimant’s split count becomes the pool size — later claimants must match or validation fails.
3. Updated `calculateItemProgress`, payer dashboard rows, and ower summary split labels to use unit-level progress instead of whole-line qty.
4. Fixed refresh storms: `useOwerSession` reads `sessionStorage` after mount (no `/name` redirect loop); payer poll slowed to 30s with signature-based silent refresh via `lib/payer-view-signature.ts`.
5. Verified with `npm test` (41 pass) and `npm run build`.

## Updates

- **2026-07-12:** Milestone completed. Unit-level shared claiming with explicit split count; payer fractional progress; ower/payer refresh recursion fixed.
