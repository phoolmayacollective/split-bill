# Milestone 14: Payer & ower account dashboards

**Status:** `in_progress`  
**Phase:** 4 — Polish & ship  
**Depends on:** M8 (encrypted payment), M10 (payer bill view)

## Goal

Let payers and owers **return to their bills** via a simple username + password — without blocking the core no-login flow.

The app must remain **fully usable as a guest**: create bill → share link → claim → pay. Accounts are optional and only help people find bills again later.

## Scope

### Payer dashboard (future)

- List bills linked to the signed-in payer (`bills.payer_id`)
- Open payer bill view (`/bill/{id}/payer`) from the list
- Sign in with username + password (same auto sign-up / sign-in as today)

### Ower dashboard (future)

- List bills where the ower has claims (match by stored ower name + optional account)
- Re-open summary / edit claims
- May reuse username account or session-based ower identity (TBD)

## Tasks

- [x] `payers` table + `POST /api/payer/auth` (auto sign-up / sign-in)
- [x] `POST /api/payer/logout`
- [x] Optional username save on payer bill view **after** bill is complete
- [x] “Continue as guest” dismisses save prompt — share link is enough
- [x] `POST /api/bills/{id}/payer/link` — attach bill to payer session
- [x] Create flow has **no login gate** — guest path is primary
- [ ] `GET /api/payer/bills` — list bills for session payer
- [ ] `/dashboard` or `/me` — payer bill list UI
- [ ] Landing secondary link: “Sign in” → dashboard (when implemented)
- [ ] Ower bill history (design + implement)

## UX principles

1. **Feature first** — create bill flow has no login gate
2. **Account second** — optional save step after bill is complete
3. **Guest always works** — link + `#password` is the credential
4. **Friends app tone** — no “Sign up”, “Register”, or business onboarding copy

## Acceptance criteria

- [x] Full create → share → claim flow works with zero account
- [x] Username + password can be saved optionally after bill creation
- [ ] Payer can sign in later and see linked bills on a dashboard
- [ ] Ower can return to past bills (TBD design)

---

## What was done (partial — 2026-07-11)

| Area | Deliverable |
|------|-------------|
| Auth API | `POST /api/payer/auth` — new username creates account; existing username verifies password; wrong password → 401 |
| Session | `lib/payer-session.ts` cookie; `POST /api/payer/logout` |
| Bill linking | `bills.payer_id` + `POST /api/bills/[id]/payer/link`; `updateBill` accepts `payer_id` |
| UX | `OptionalSaveAccount` on payer dashboard; create flow goes straight to `/create/manual` |
| Tests | `lib/payer-account.test.ts`, `lib/payer-password.test.ts` |

## How it was done (partial)

1. Added `payers` migration and scrypt password hashing in `lib/payer-account.ts`.
2. Built auth route with unified sign-up/sign-in logic (no separate registration page).
3. Removed pre-create auth gate; moved optional username form to bottom of `PayerBillPage` after share/payment setup.
4. Landing CTA goes directly to bill creation; account save is dismissible with “Continue as guest”.
5. Verified auth + link API with unit tests and production build.

## Updates

- **2026-07-11:** Milestone added. Stub shipped: optional post-create username save, no login gate on create. Dashboard UI deferred.
