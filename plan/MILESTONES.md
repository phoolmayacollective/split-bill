# Milestones

Last updated: 2026-07-10

Track progress here and in each file under [`milestones/`](./milestones/).

| # | Milestone | Phase | Status | Depends on |
|---|-----------|-------|--------|------------|
| 1 | [Project bootstrap](./milestones/01-bootstrap.md) | 1 | `completed` | — |
| 2 | [Database schema](./milestones/02-database-schema.md) | 1 | `completed` | 1 |
| 3 | [Split calculation logic](./milestones/03-split-logic.md) | 1 | `completed` | 1 |
| 4 | [Bill & claims API](./milestones/04-bill-api.md) | 1 | `completed` | 2, 3 |
| 5 | [Payer UI — manual bill](./milestones/05-payer-ui-manual.md) | 1 | `completed` | 4 |
| 6 | [Ower UI — claim & summary](./milestones/06-ower-ui-claims.md) | 1 | `completed` | 4 |
| 7 | [Client-side crypto](./milestones/07-client-crypto.md) | 2 | `pending` | 1 |
| 8 | [Encrypted payment flow](./milestones/08-encrypted-payment.md) | 2 | `pending` | 5, 7 |
| 9 | [Ower decrypt & payment summary](./milestones/09-ower-decrypt.md) | 2 | `pending` | 6, 7, 8 |
| 10 | [Receipt scan (OCR)](./milestones/10-receipt-scan.md) | 3 | `pending` | 5 |
| 11 | [Shared-item & tax/tip polish](./milestones/11-split-polish.md) | 4 | `pending` | 6 |
| 12 | [Mobile UX & share tools](./milestones/12-mobile-share.md) | 4 | `pending` | 9 |
| 13 | [Payer edit token & bill lifecycle](./milestones/13-bill-lifecycle.md) | 4 | `pending` | 8 |
| 14 | [Deploy MVP](./milestones/14-deploy.md) | 4 | `pending` | 9, 11 |

## Phase summary

| Phase | Milestones | Goal |
|-------|------------|------|
| **1 — Core flow** | 1–6 | Manual bill, claim items, summary — no crypto, no OCR |
| **2 — Zero-knowledge payment** | 7–9 | Encrypt payment details client-side; password in URL fragment |
| **3 — OCR** | 10 | Scan receipt → editable line items |
| **4 — Polish & ship** | 11–14 | Splitting UX, mobile, edit token, expiry, deploy |

## Progress

- **Completed:** 6 / 14
- **In progress:** 0
- **Pending:** 8

## Completed work log

### M1 — Project bootstrap (2026-07-10)

**What:** Next.js 16 app with Tailwind v4, shadcn/ui, Supabase client stub, landing page.

**How:** `create-next-app` via `web/` subfolder workaround (folder name has a space) → shadcn init → install deps → `lib/supabase.ts` + `/` and `/create` pages → build/lint verified.

**Details:** [milestones/01-bootstrap.md](./milestones/01-bootstrap.md)

### M2 — Database schema (2026-07-10)

**What:** `bills` + `claims` tables on Supabase; typed query helpers in repo.

**How:** Supabase MCP `apply_migration` (`initial_schema`) on project `prgjjnudjnaohmeqhhhm` → `generate_typescript_types` → `lib/db/bills.ts` + local `supabase/migrations/001_initial.sql`.

**Details:** [milestones/02-database-schema.md](./milestones/02-database-schema.md)

**Blocked on user:** Paste `SUPABASE_SERVICE_ROLE_KEY` into `.env.local` (Dashboard → API settings).

### M3 — Split calculation logic (2026-07-10)

**What:** Pure functions for claim-based bill splitting with proportional tax/tip.

**How:** `lib/split.ts` with `calculateSplits` / `calculateOwerTotal`; tax/tip scaled to claimed portion of bill subtotal; 6 unit tests via `npm test`.

**Details:** [milestones/03-split-logic.md](./milestones/03-split-logic.md)

### M4 — Bill & claims API (2026-07-10)

**What:** REST API for creating bills, fetching bills with claims, recording ower claims, and computing per-ower summary totals.

**How:** Zod schemas in `lib/api/schemas.ts`; four route handlers under `app/api/bills/` wired to `lib/db/bills.ts` and `lib/split.ts`; payment ciphertext fields stripped in phase 1; verified with `npm run build` and curl integration tests. Shipped in `5c28f5c` on `origin/main`.

**Details:** [milestones/04-bill-api.md](./milestones/04-bill-api.md)

### M5 — Payer UI manual bill (2026-07-10)

**What:** Mobile-first payer flow — manual item entry, tax/tip review, POST bill, share link with copy button.

**How:** `app/create` hub + `/create/manual` client form with `BillItemEditor`; `lib/bill-totals.ts` for live totals; POST to `/api/bills` then redirect to `/bill/{id}/share`; `CopyShareLink` uses `NEXT_PUBLIC_APP_URL`; verified with build/lint and curl. Shipped in `5c28f5c` on `origin/main`.

**Details:** [milestones/05-payer-ui-manual.md](./milestones/05-payer-ui-manual.md)

### M6 — Ower UI claim & summary (2026-07-10)

**What:** Mobile-first ower flow — set name, claim items with checkboxes, see proportional tax/tip breakdown and total owed.

**How:** `/bill/{id}` redirects to name step; `sessionStorage` carries ower name; `OwerItemPicker` uses `calculateOwerTotal()` for live preview; sticky footer on items page; POST new claims then summary from `/api/bills/{id}/summary`; verified with build/lint/test and curl.

**Details:** [milestones/06-ower-ui-claims.md](./milestones/06-ower-ui-claims.md)

## Next up

**M7 — Client-side crypto** — AES-GCM + PBKDF2 helpers for zero-knowledge payment details (Phase 2).

## How to update

1. Change **Status** in the milestone file: `pending` → `in_progress` → `completed`
2. Check off tasks (`- [ ]` → `- [x]`)
3. Add **What was done**, **How it was done**, and dated notes under **Updates**
4. Add a row to **Completed work log** in this file
5. Sync the status column in the table above
