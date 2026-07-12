# Milestone 14: Payer & ower account dashboards

**Status:** `in_progress`  
**Phase:** 4 — Polish & ship  
**Depends on:** M8 (encrypted payment), M10 (payer bill view)

## Goal

Let payers and owers **return to their bills** via a simple username + password — without blocking the core no-login flow.

The app must remain **fully usable as a guest**: create bill → share link → claim → pay. Accounts are optional and only help people find bills again later — and let signed-in payers **reuse frequent people** via a saved circle when starting new bills.

## Scope

### Payer dashboard (future)

- List bills linked to the signed-in payer (`bills.payer_id`)
- Open payer bill view (`/bill/{id}/payer`) from the list
- Sign in with username + password (same auto sign-up / sign-in as today)

### Payer circle (future)

- A signed-in payer can save other **registered usernames** to their personal circle (one-way saved contacts — no acceptance or invite flow)
- Circle is managed from the payer dashboard (or a `/me` settings area on the same page)
- Add by username lookup; remove anytime
- Cannot add yourself; dedupe case-insensitively (match existing username rules in `lib/payer-account.ts`)
- Circle is **private** — only the owner sees their list

### Quick-add circle to bill roster (future)

- On `/create/manual` and restaurant create flows, when a payer session exists, show circle members as **one-tap chips** above the free-text participant input in `ParticipantListEditor`
- Tapping a chip adds that username to `participants[]` (same storage as today — no bill-schema change required for MVP)
- Free-text add/remove stays for guests, one-off names, and people not in circle
- Unsigned-in payers see today's UI only (no circle chips)

### Ower dashboard (future)

- List bills where the ower has claims (match by stored ower name + optional account)
- Re-open summary / edit claims
- May reuse username account or session-based ower identity (TBD)

## Out of scope

- Mutual / two-way friend requests
- Ower accounts or circle membership for owers
- Linking `participants` to `payer_id` FK (roster stays `string[]` for MVP)
- Notifications when added to someone's circle
- Post-create participant editing (see M17 or separate work if ever)

## Tasks

### Auth & bill linking (done)

- [x] `payers` table + `POST /api/payer/auth` (auto sign-up / sign-in)
- [x] `POST /api/payer/logout`
- [x] Optional username save on payer bill view **after** bill is complete
- [x] “Continue as guest” dismisses save prompt — share link is enough
- [x] `POST /api/bills/{id}/payer/link` — attach bill to payer session
- [x] Create flow has **no login gate** — guest path is primary

### Dashboard (pending)

- [ ] `GET /api/payer/bills` — list bills for session payer
- [ ] `/dashboard` or `/me` — payer bill list UI
- [ ] Landing secondary link: “Sign in” → dashboard (when implemented)
- [ ] Ower bill history (design + implement)

### Circle data & API (pending)

- [ ] `payer_circle` table — `owner_payer_id`, `member_payer_id`, `created_at`; unique `(owner_payer_id, member_payer_id)`
- [ ] `GET /api/payer/circle` — list circle members for session payer (return usernames)
- [ ] `POST /api/payer/circle` — add member by username (validate exists, not self, not duplicate)
- [ ] `DELETE /api/payer/circle/{memberPayerId}` — remove from circle

### Circle & create-flow UI (pending)

- [ ] Circle management section on `/dashboard` or `/me` — list, add-by-username, remove
- [ ] Empty state copy in friends-app tone (e.g. “People you split with often”)
- [ ] Fetch circle when signed in on create pages; pass to `ParticipantListEditor`
- [ ] Circle quick-add chips; skip already-added roster names
- [ ] Works on manual create and Dal Bhat form (`components/restaurant/dalbhat-bill-form.tsx`)

### Tests (pending)

- [ ] Unit tests for circle validation (self-add, unknown username, dedupe)
- [ ] API or integration tests for add/list/remove

## UX principles

1. **Feature first** — create bill flow has no login gate
2. **Account second** — optional save step after bill is complete
3. **Guest always works** — link + `#password` is the credential
4. **Friends app tone** — no “Sign up”, “Register”, or business onboarding copy
5. **Circle is convenience, not required** — accounts work without building a circle; typing names always works
6. **Usernames on the roster** — circle entries use registered usernames so repeat splits stay consistent

## Acceptance criteria

### Auth (done)

- [x] Full create → share → claim flow works with zero account
- [x] Username + password can be saved optionally after bill creation

### Dashboard (pending)

- [ ] Payer can sign in later and see linked bills on a dashboard
- [ ] Ower can return to past bills (TBD design)

### Circle (pending)

- [ ] Signed-in payer with `alex` and `bob` in circle opens create bill → taps both → roster shows `alex`, `bob` without typing
- [ ] Guest payer (no session) sees no circle UI; free-text roster still works
- [ ] Adding a non-existent username to circle returns a clear error
- [ ] Circle member removed from circle no longer appears as quick-add chip on future bills (existing bills unchanged)
- [ ] Ower name step still works — circle usernames appear as selectable roster chips (reuses M10 `OwerNameForm`)

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
- **2026-07-12:** Scope expanded — payer circle (one-way saved contacts) + quick-add to participant roster at bill create. Dashboard bill list still pending.
