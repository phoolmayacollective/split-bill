# Milestone 4: Bill & claims API

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** Milestones 2, 3  
**Completed:** 2026-07-10

## Goal

API routes for creating bills, fetching them, and recording ower claims.

## Tasks

- [x] `POST /api/bills` — create bill (items, totals; payment fields null in phase 1)
- [x] `GET /api/bills/[id]` — return bill + existing claims (no payment ciphertext use yet)
- [x] `POST /api/bills/[id]/claims` — ower name + item claims
- [x] `GET /api/bills/[id]/summary` — computed totals per ower (no payment details in phase 1)
- [x] Zod validation on all payloads
- [x] Error handling (404, 400)

## Acceptance criteria

- Payer can POST a manual bill and get `billId`
- Ower can POST claims and GET summary with correct amounts

---

## What was done

| Area | Deliverable |
|------|-------------|
| Validation | `lib/api/schemas.ts` — Zod schemas for bills, claims, bill id |
| HTTP helpers | `lib/api/http.ts` — JSON parse/response helpers, 400/404/500 |
| Public bill shape | `lib/api/bills.ts` — `toPublicBill()` strips payment ciphertext fields |
| Create bill | `POST /api/bills` → `{ billId }` |
| Fetch bill | `GET /api/bills/[id]` → bill + claims |
| Record claims | `POST /api/bills/[id]/claims` → ower name + item claims |
| Summary | `GET /api/bills/[id]/summary` → per-ower totals via `calculateSplits` |

## How it was done

1. **Zod schemas** — `createBillSchema` (items + totals), `createClaimsSchema` (ower name + claims with duplicate-item guard), `billIdSchema` for route params.
2. **Route handlers** — four App Router route files under `app/api/bills/`; reuse `lib/db/bills.ts` for persistence and `lib/split.ts` for summary math.
3. **Phase 1 security** — `toPublicBill()` omits `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations` from all responses.
4. **Claims validation** — reject claims referencing item ids not on the bill (400); invalid UUID bill id → 400; missing bill → 404.
5. **Verified** — `npm run build`, `npm run lint`, and live curl against `npm run dev` (create → get → claim → summary).

## Key files

```
lib/api/schemas.ts
lib/api/http.ts
lib/api/bills.ts
app/api/bills/route.ts
app/api/bills/[id]/route.ts
app/api/bills/[id]/claims/route.ts
app/api/bills/[id]/summary/route.ts
```

## Updates

- **2026-07-10:** Started M4 — Bill & claims API routes.
- **2026-07-10:** Milestone completed. Four API routes with Zod validation, error handling, and integration-tested against Supabase.
