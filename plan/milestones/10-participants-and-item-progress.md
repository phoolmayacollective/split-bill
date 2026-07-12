# Milestone 10: Participants roster & item payment progress

**Status:** `completed`  
**Completed:** 2026-07-11  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestones 6, 8

## Goal

Make group bills faster to join and give the payer a live, visual picture of how much of each shared item has been settled.

## Features

### 1. Participant roster at bill creation

- Payer can add expected participants (names) while creating the bill.
- On the ower name step, if the user's name is on the roster they pick from the list instead of typing.
- Free-text name entry remains for guests not on the list.

### 2. Shared-item splits with payment progress

- Ower can split one item among multiple people (builds on M11 shared-item claiming).
- Payer sees per-item payment progress on the bill — e.g. a pizza split 3 ways shows **33% paid** after one person settles their share.
- Progress shown with friendly in-bill graphics (progress ring, segmented bar, or similar) on the payer's bill view.

## Tasks

### Participant roster

- [x] Extend bill create flow: optional participant name list (add / remove / reorder)
- [x] Persist roster on bill (e.g. `participants: string[]` on bill record or related table)
- [x] Ower name step: show roster as selectable chips or list when non-empty
- [x] Allow "Someone else" / custom name when not on roster
- [x] Normalize or dedupe roster entries (trim whitespace, case-insensitive match)

### Item payment progress

- [x] Model per-claimant payment status (e.g. `paidAt` on claim or separate settlement flag)
- [x] Payer can mark an ower as paid, or ower self-reports paid (decide UX in implementation)
- [x] Compute per-item `% paid` from claim shares and settlement state
- [x] Payer bill view: item row shows progress indicator + percentage label
- [x] Visual design: compact, cute graphics inline with line items (not a separate dashboard)
- [x] Edge cases: partial shares, unclaimed portions, rounding to whole percentages

## Acceptance criteria

- Payer adds "Alice", "Bob", "Carol" at create time; Carol opens link and selects her name from the list without typing.
- Three owers claim equal shares of one $30 item; one marks paid → payer sees ~33% paid on that item with a clear visual.
- Roster is optional — bills without a roster keep today's free-text name flow.
- Progress updates when payer refreshes or reopens the bill view.

## Notes

- **M11** covers shared-item claiming and tax/tip breakdown; this milestone adds roster UX and settlement visibility for the payer.
- Payment progress is **settlement tracking**, not on-chain or automated payment verification — it reflects who the payer (or group) considers paid.
- Ower self-report ("I've paid" on summary) and payer "Mark paid" both write to the same `ower_payments` table.

---

## What was done

| Area | Deliverable |
|------|-------------|
| Database | `ower_payments` table — `supabase/migrations/002_ower_payments.sql` |
| Database | `participants jsonb` on `bills` — `supabase/migrations/003_participants.sql` |
| DB helpers | `lib/db/ower-payments.ts` — `getOwerPayments`, `markOwerPaid` |
| Progress logic | `lib/item-progress.ts` — `calculateItemProgress()`; 4 unit tests |
| Participants logic | `lib/participants.ts` — normalize, match, parse; 6 unit tests |
| Payer API | `GET /api/bills/[id]/payer` + `lib/api/payer.ts` — items, progress, ower totals |
| Mark paid API | `POST /api/bills/[id]/paid` — validates claims, upserts `ower_payments` |
| Bill API | `POST /api/bills` accepts optional `participants`; `GET` returns roster |
| Summary helper | `lib/api/summary.ts` — `getBillOwerSummaries()` attaches `paid_at` per ower |
| Payer UI | `app/bill/[id]/payer/page.tsx` + `components/payer-bill-page.tsx` |
| Progress graphics | Segmented bar per claimant (paid = solid, pending = faded) + `% paid` label |
| Live updates | 4s poll + `visibilitychange` refresh on payer view |
| Share redirect | `/bill/{id}/share` → `/bill/{id}/payer` preserving `#password` hash |
| Ower self-report | `components/ower-summary-page.tsx` — "I've paid" button |
| Create flow | `components/participant-list-editor.tsx` on `/create/manual` |
| Ower name picker | `components/ower-name-form.tsx` — roster chips + "Someone else" |

## How it was done

### Item payment progress

1. **Settlement storage** — `ower_payments(bill_id, ower_name, paid_at)` with composite PK; migration mirrored locally in `supabase/migrations/002_ower_payments.sql`.
2. **Progress math** — `calculateItemProgress()` groups claims by item, weights `% paid` by share (e.g. 1 of 3 equal sharers → 33%), handles unclaimed / pending / settled states.
3. **Payer view API** — `getBillPayerView()` joins normalized bill, `getBillOwerSummaries()`, and item progress into one payload for the client.
4. **Mark paid** — shared `POST /api/bills/[id]/paid` for payer ("Mark paid" on roster) and ower ("I've paid" on summary); rejects names with no claims.
5. **Payer page** — `PayerBillPage` embeds `ShareBillContent` for copy link, shows collection totals, per-item progress bars with claimant breakdown, and ower list with mark-paid actions.
6. **Share route** — `ShareBillRedirect` client-redirects `/bill/{id}/share` to `/bill/{id}/payer` so the payer lands on the live bill view after create.

### Participant roster

1. **Schema** — `participants jsonb default '[]'` on `bills`; applied via Supabase MCP + local `003_participants.sql`.
2. **Normalization** — `normalizeParticipants()` trims, drops empties, dedupes case-insensitively (keeps first spelling); used in Zod `createBillSchema` and client editor.
3. **Create UI** — `ParticipantListEditor` on manual bill page: add names, reorder with up/down, remove; optional — omitted from POST when empty.
4. **Ower name step** — when roster non-empty, show selectable name chips; "Someone else" reveals free-text input; custom entry still canonicalizes to roster spelling on case-insensitive match.
5. **Public bill** — `toPublicBill()` includes `participants` so client flows can read the roster.

## Key files

```
supabase/migrations/002_ower_payments.sql
supabase/migrations/003_participants.sql
lib/db/ower-payments.ts
lib/item-progress.ts
lib/participants.ts
lib/api/payer.ts
lib/api/summary.ts
lib/api/schemas.ts
app/api/bills/[id]/payer/route.ts
app/api/bills/[id]/paid/route.ts
app/bill/[id]/payer/page.tsx
components/payer-bill-page.tsx
components/participant-list-editor.tsx
components/ower-name-form.tsx
app/create/manual/page.tsx
components/share-bill-redirect.tsx
components/payment-form.tsx
components/ower-summary-page.tsx
```

## Updates

- **2026-07-11:** Started M10 — payer bill view + item payment progress after M9.
- **2026-07-11:** Item payment progress shipped. Payer view at `/bill/{id}/payer#password`; share route redirects; segmented progress bars + mark paid (payer and ower).
- **2026-07-11:** Milestone completed. Participant roster at create + ower name picker; `participants` column on bills. Verified with 21 tests, lint, build.
