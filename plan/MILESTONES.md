# Milestones

Last updated: 2026-07-12

Track progress here and in each file under [`milestones/`](./milestones/).

| # | Milestone | Phase | Status | Depends on |
|---|-----------|-------|--------|------------|
| 1 | [Project bootstrap](./milestones/01-bootstrap.md) | 1 | `completed` | — |
| 2 | [Database schema](./milestones/02-database-schema.md) | 1 | `completed` | 1 |
| 3 | [Split calculation logic](./milestones/03-split-logic.md) | 1 | `completed` | 1 |
| 4 | [Bill & claims API](./milestones/04-bill-api.md) | 1 | `completed` | 2, 3 |
| 5 | [Payer UI — manual bill](./milestones/05-payer-ui-manual.md) | 1 | `completed` | 4 |
| 6 | [Ower UI — claim & summary](./milestones/06-ower-ui-claims.md) | 1 | `completed` | 4 |
| 7 | [Client-side crypto](./milestones/07-client-crypto.md) | 2 | `completed` | 1 |
| 8 | [Encrypted payment flow](./milestones/08-encrypted-payment.md) | 2 | `completed` | 5, 7 |
| 9 | [Ower decrypt & payment summary](./milestones/09-ower-decrypt.md) | 2 | `completed` | 6, 7, 8 |
| 10 | [Participants roster & item payment progress](./milestones/10-participants-and-item-progress.md) | 2 | `completed` | 6, 8 |
| 11 | [Receipt scan (OCR)](./milestones/11-receipt-scan.md) | 3 | `pending` | 5 |
| 12 | [Shared-item & tax/tip polish](./milestones/12-split-polish.md) | 4 | `completed` | 6 |
| 13 | [Mobile UX & share tools](./milestones/13-mobile-share.md) | 4 | `in_progress` | 9 |
| 14 | [Payer edit token & bill lifecycle](./milestones/14-bill-lifecycle.md) | 4 | `pending` | 8 |
| 15 | [Deploy MVP](./milestones/15-deploy.md) | 4 | `pending` | 9, 12 |
| 16 | [Payer & ower account dashboards](./milestones/16-payer-ower-dashboards.md) | 4 | `in_progress` | 8, 10 |
| 17 | [Dal Bhat restaurant menu](./milestones/17-dalbhat-restaurant-menu.md) | 5 | `completed` | 4, 5, 8 |

## Phase summary

| Phase | Milestones | Goal |
|-------|------------|------|
| **1 — Core flow** | 1–6 | Manual bill, claim items, summary — no crypto, no OCR |
| **2 — Zero-knowledge payment** | 7–10 | Encrypt payment details client-side; payer bill view, settlement tracking, participant roster |
| **3 — OCR** | 11 | Scan receipt → editable line items |
| **4 — Polish & ship** | 12–16 | Splitting UX, mobile, edit token, deploy, optional account dashboards |
| **5 — Restaurant menus** | 17 | Static restaurant menu → bill create (Dal Bhat first) |

## Progress

- **Completed:** 12 / 17
- **In progress:** 2 (M13 UI/UX polish, M16 account stub)
- **Pending:** 3

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

**How:** `/bill/{id}` redirects to name step; `sessionStorage` carries ower name; `OwerItemPicker` uses `calculateOwerTotal()` for live preview; sticky footer on items page; POST new claims then summary from `/api/bills/{id}/summary`; verified with build/lint/test and curl. Shipped in `fc0aa9a` on `origin/main`.

**Details:** [milestones/06-ower-ui-claims.md](./milestones/06-ower-ui-claims.md)

### M7 — Client-side crypto (2026-07-11)

**What:** Browser-only PBKDF2 + AES-GCM helpers for encrypting payment details; password never touches the server.

**How:** `lib/crypto.ts` with `encryptPaymentDetails` / `decryptPaymentDetails`; 100k PBKDF2 iterations, random salt/IV, base64 transport; 3 unit tests via `npm test`; build/lint verified.

**Details:** [milestones/07-client-crypto.md](./milestones/07-client-crypto.md)

### M8 — Encrypted payment flow (2026-07-11)

**What:** Payer adds PayPal/IBAN on a payment step; browser encrypts client-side; share link includes `#password` fragment; only ciphertext stored server-side.

**How:** `/create/{id}/payment` form encrypts via M7 helpers and PATCHes `/api/bills/[id]`; `ShareBillContent` reads hash for full copy URL; manual create redirects to payment step first; curl verified ciphertext not in public GET.

**Details:** [milestones/08-encrypted-payment.md](./milestones/08-encrypted-payment.md)

### M9 — Ower decrypt & payment summary (2026-07-11)

**What:** Ower summary auto-unlocks payment details from URL `#password` (or manual entry); PayPal/IBAN decrypted client-side with copy buttons.

**How:** `lib/bill-password.ts` + `CaptureBillPassword` in bill layout persist hash to sessionStorage; `toPublicBill()` returns ciphertext; `OwerSummaryPage` decrypts via M7 helpers and shows payment block with wrong-password handling.

**Details:** [milestones/09-ower-decrypt.md](./milestones/09-ower-decrypt.md)

### M10 — Participants roster & item payment progress (2026-07-11)

**What:** Payer bill view with per-item settlement progress; optional participant roster at create so owers pick their name from a list.

**How:** `ower_payments` table + `calculateItemProgress()` power segmented progress bars on `/bill/{id}/payer`; `participants jsonb` on bills with `ParticipantListEditor` at create and roster chips on the ower name step; 21 unit tests, build/lint verified.

**Details:** [milestones/10-participants-and-item-progress.md](./milestones/10-participants-and-item-progress.md)

### M12 — Shared-item & tax/tip polish (2026-07-12)

**What:** Unit-level shared claiming — multi-qty items expand to individual rows; explicit “split with N people”; fractional payer progress; refresh recursion fixed.

**How:** `lib/bill-units.ts` + `lib/claim-units.ts` with pool validation; split/progress/API updated for unit IDs; `useOwerSession` + 30s payer poll with `payerViewSignature` silent refresh; 41 tests, build verified.

**Details:** [milestones/12-split-polish.md](./milestones/12-split-polish.md)

### M17 — Dal Bhat restaurant menu (2026-07-12)

**What:** Static Dal Bhat menu at `/restaurant/dalbhat` — searchable picker with options, momo portions, drink sizes; posts to existing bill API and continues through payment → share.

**How:** `data/restaurants/dalbhat-menu.json` + typed helpers in `lib/restaurants/`; `DalbhatBillForm` cart with `filterDalbhatMenu()` search/filter; `formatEuro()` for prices; `POST /api/bills` then redirect to `/create/{id}/payment`. URL-only route — no home page link.

**Details:** [milestones/17-dalbhat-restaurant-menu.md](./milestones/17-dalbhat-restaurant-menu.md)

## In progress work log

### M13 — Mobile UX & share tools (started 2026-07-11)

**What:** Warm-modern UI refresh — shared layout components, mobile tap targets, sticky footers, copy/Web Share, loading/error/empty states across payer and ower flows.

**How:** OKLCH tokens + `components/layout/*` and `components/feedback/*`; refactored all completed route pages; `CopyField` with clipboard + Web Share fallback; branded `loading`/`error`/`not-found` routes. QR and separate-password mode still open.

**Details:** [milestones/13-mobile-share.md](./milestones/13-mobile-share.md)

### M16 — Payer & ower account dashboards (started 2026-07-11)

**What:** Optional payer username auth stub — no login gate on create; save username after bill is done; link bill to account for future dashboard.

**How:** `POST /api/payer/auth` (auto sign-up/sign-in), `payers` table, `OptionalSaveAccount` on payer dashboard, `POST /api/bills/{id}/payer/link`. Create flow primary path is guest → items → payment → share. Dashboard list UI not yet built.

**Details:** [milestones/16-payer-ower-dashboards.md](./milestones/16-payer-ower-dashboards.md)

## Next up

**M11 — Receipt scan (OCR)** — Image upload → LLM vision → editable line items (Phase 3).

## How to update

1. Change **Status** in the milestone file: `pending` → `in_progress` → `completed`
2. Check off tasks (`- [ ]` → `- [x]`)
3. Add **What was done**, **How it was done**, and dated notes under **Updates**
4. Add a row to **Completed work log** in this file
5. Sync the status column in the table above
