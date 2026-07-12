# Milestones

Last updated: 2026-07-12 (M16 completed — receipt scan shipped)

Milestones **M1–M18** are numbered in **chronological build order**: completed work first (M1–M12), then active work by start date (M13–M15), then planned work (M16–M18).

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
| 11 | [Shared-item & tax/tip polish](./milestones/11-split-polish.md) | 4 | `completed` | 6 |
| 12 | [Dal Bhat restaurant menu](./milestones/12-dalbhat-restaurant-menu.md) | 5 | `completed` | 4, 5, 8 |
| 13 | [Mobile UX & share tools](./milestones/13-mobile-share.md) | 4 | `completed` | 9 |
| 14 | [Payer & ower account dashboards](./milestones/14-payer-ower-dashboards.md) | 4 | `in_progress` | 8, 10 |
| 15 | [Automated demo video](./milestones/15-demo-video.md) | 6 | `in_progress` | 6, 9, 10 |
| 16 | [Receipt scan (OCR)](./milestones/16-receipt-scan.md) | 3 | `completed` | 5 |
| 17 | [Payer edit token & bill lifecycle](./milestones/17-bill-lifecycle.md) | 4 | `pending` | 8 |
| 18 | [Deploy MVP](./milestones/18-deploy.md) | 4 | `pending` | 9, 11 |

## Phase summary

| Phase | Milestones | Goal |
|-------|------------|------|
| **1 — Core flow** | 1–6 | Manual bill, claim items, summary — no crypto, no OCR |
| **2 — Zero-knowledge payment** | 7–10 | Encrypt payment details client-side; payer bill view, settlement tracking, participant roster |
| **3 — OCR** | 16 | Scan receipt → editable line items |
| **4 — Polish & ship** | 11, 13, 14, 17, 18 | Splitting UX, mobile, account dashboards, edit token, deploy |
| **5 — Restaurant menus** | 12 | Static restaurant menu → bill create (Dal Bhat first) |
| **6 — Demo tooling** | 15 | Scripted product walkthrough → silent or narrated MP4 |

## Progress

- **Completed:** 14 / 18 (M1–M13, M16)
- **In progress:** 2 (M14, M15)
- **Pending:** 2 (M17, M18)

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

### M11 — Shared-item & tax/tip polish (2026-07-12)

**What:** Unit-level shared claiming — multi-qty items expand to individual rows; explicit “split with N people”; fractional payer progress; refresh recursion fixed.

**How:** `lib/bill-units.ts` + `lib/claim-units.ts` with pool validation; split/progress/API updated for unit IDs; `useOwerSession` + 30s payer poll with `payerViewSignature` silent refresh; 41 tests, build verified.

**Details:** [milestones/11-split-polish.md](./milestones/11-split-polish.md)

### M12 — Dal Bhat restaurant menu (2026-07-12)

**What:** Static Dal Bhat menu at `/restaurant/dalbhat` — fuzzy-searchable picker with highlighted matches, options, momo portions, drink sizes; posts to existing bill API and continues through payment → share.

**How:** `data/restaurants/dalbhat-menu.json` + typed helpers in `lib/restaurants/`; `lib/fuzzy-search.ts` subsequence matcher wired into `filterDalbhatMenu()`; `MenuSearchHighlight` in `DalbhatBillForm`; `formatEuro()` for prices; `POST /api/bills` then redirect to `/create/{id}/payment`. URL-only route — no home page link.

**Details:** [milestones/12-dalbhat-restaurant-menu.md](./milestones/12-dalbhat-restaurant-menu.md)

### M13 — Mobile UX & share tools (2026-07-12)

**What:** Warm-modern mobile UX across payer/ower flows — layout primitives, sticky CTAs, copy/Web Share, QR code on payer share card, and optional separate-password sharing mode.

**How:** OKLCH tokens + `components/layout/*` and `components/feedback/*`; `ShareQrCode` via `react-qr-code`; `ShareBillContent` toggle for link-only sharing with password `CopyField`; branded loading/error/404 routes. Verified with `npm test` and `npm run build`.

**Details:** [milestones/13-mobile-share.md](./milestones/13-mobile-share.md)

## In progress work log

### M14 — Payer & ower account dashboards (started 2026-07-11)

**What:** Optional payer username auth — no login gate on create; save username after bill is done; payer dashboard with linked bills; saved circle of registered usernames for quick participant add at bill create.

**How:** Auth stub (2026-07-11): `POST /api/payer/auth`, `payers` table, `OptionalSaveAccount`, bill linking. Dashboard + circle (2026-07-12): `payer_circle` migration, circle CRUD APIs, `/dashboard` UI, `ParticipantListEditor` quick-add chips on manual + Dal Bhat create. Ower bill history still TBD.

**Details:** [milestones/14-payer-ower-dashboards.md](./milestones/14-payer-ower-dashboards.md)

### M15 — Automated demo video (started 2026-07-12)

**What:** Playwright silent walkthrough with demo-only persona banner; WaveNet narrated MP4 pipeline scoped.

**How:** `e2e/demo-walkthrough.spec.ts` + `scripts/run-demo-video.mjs` on port 3001; `DemoPersonaBanner` gated by `NEXT_PUBLIC_DEMO_MODE`. Narration (GCP WaveNet + ffmpeg) pending user credentials.

**Details:** [milestones/15-demo-video.md](./milestones/15-demo-video.md)

### M16 — Receipt scan (OCR) (2026-07-12)

**What:** End-to-end receipt scan — browser OCR → server text parse → review with **tax inclusive toggle**; home + `/create` scan entry; neutral product copy (no engine names in UI).

**How:** `detect-text.ts` → scan page POSTs OCR lines to `/api/ocr` (`parse-receipt-gemini.ts`) → `BillItemEditor` review; `HomePageActions` + `/create` hub link to `/create/scan`. Live German receipt test passed; `npm test` + `npm run build` pass.

**Details:** [milestones/16-receipt-scan.md](./milestones/16-receipt-scan.md)

## Next up

**M14 — Account dashboards** — Payer circle + dashboard list UI (Phase 4). Optional: broader receipt quality trials and a scan demo scene (M15/M16 follow-up).

## How to update

1. Change **Status** in the milestone file: `pending` → `in_progress` → `completed`
2. Check off tasks (`- [ ]` → `- [x]`)
3. Add **What was done**, **How it was done**, and dated notes under **Updates**
4. Add a row to **Completed work log** in this file
5. Sync the status column in the table above
