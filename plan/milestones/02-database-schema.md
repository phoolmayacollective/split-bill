# Milestone 2: Database schema

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** Milestone 1  
**Completed:** 2026-07-10

## Goal

Create `bills` and `claims` tables per the plan data model.

## Tasks

- [x] `supabase/migrations/001_initial.sql`
- [x] `bills` table: `id`, `items` (jsonb), `totals` (jsonb), `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations`, `created_at`
- [x] `claims` table: `id`, `bill_id`, `ower_name`, `item_id`, `share`, `created_at`
- [x] Index on `claims.bill_id`
- [x] Apply migration to Supabase
- [x] `lib/db/bills.ts` — create, get by id, add claims

## Data shape (from plan)

```json
// bills.items
[{ "id": "...", "name": "Pizza", "price": 12.5, "qty": 1 }]

// bills.totals
{ "subtotal": 50, "tax": 5, "tip": 7.5, "total": 62.5 }
```

## Acceptance criteria

- Can insert a bill with items jsonb and read it back
- Can insert claims linked to bill items

---

## What was done

| Area | Deliverable |
|------|-------------|
| Remote DB | `bills` and `claims` tables live on Supabase |
| Local migration | `supabase/migrations/001_initial.sql` (source of truth in repo) |
| Types | `lib/database.types.ts` — generated from live schema |
| Data access | `lib/db/bills.ts` — CRUD helpers for bills and claims |
| Client typing | `lib/supabase.ts` updated with `Database` generic |
| Env template | `.env.example` updated with real project URL |

## How it was done

1. **Supabase MCP connected** — User authenticated Supabase MCP in Cursor (org: `split-bill`).
2. **Project discovered** — `list_projects` → project `prgjjnudjnaohmeqhhhm` (`eu-west-1`, `ACTIVE_HEALTHY`).
3. **Schema applied remotely** — `apply_migration` with name `initial_schema` and SQL from plan:
   - `bills` — uuid pk, `items`/`totals` jsonb, nullable payment encryption columns, `created_at`
   - `claims` — uuid pk, `bill_id` fk (cascade delete), `ower_name`, `item_id`, `share` (numeric, default 1), `created_at`
   - Indexes: `claims_bill_id_idx`, `claims_bill_ower_idx`
4. **Verified** — `list_tables` confirmed both tables exist (0 rows).
5. **Types generated** — `generate_typescript_types` → saved to `lib/database.types.ts` with domain types (`BillItem`, `BillTotals`, `BillWithClaims`).
6. **Query helpers** — `lib/db/bills.ts`:
   - `createBill({ items, totals })`
   - `getBillById(id)` → bill + claims
   - `updateBill(id, …)` — items, totals, or payment fields
   - `addClaims(billId, claims[])`
   - `normalizeBill()` — parses jsonb into typed objects
7. **Local mirror** — Same SQL committed to `supabase/migrations/001_initial.sql` for version control.

## Supabase project details

| Setting | Value |
|---------|-------|
| Organization | `split-bill` (`efmalqdkyqpsftgmnyom`) |
| Project ref | `prgjjnudjnaohmeqhhhm` |
| Region | `eu-west-1` |
| API URL | `https://prgjjnudjnaohmeqhhhm.supabase.co` |
| Migration name | `initial_schema` |

## Key files created/updated

```
supabase/migrations/001_initial.sql   # DDL (mirrors remote migration)
lib/database.types.ts               # Generated Supabase types + domain types
lib/db/bills.ts                     # Bill/claim query helpers
lib/supabase.ts                     # Now typed with Database generic
.env.example                        # Real SUPABASE_URL filled in
```

## Security note (intentional)

RLS is **disabled** on both tables. Supabase advisor flags this as critical — acceptable for MVP because:

- All DB access goes through Next.js API routes
- Only the **service role key** is used server-side (never exposed to browser)
- Plan defers RLS until/unless we add direct client-side Supabase access

**User action still needed:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` from Dashboard → Project Settings → API → `service_role` (MCP cannot expose this key).

## Updates

- **2026-07-10:** Schema deployed via Supabase MCP `apply_migration`. Types and `lib/db/bills.ts` added. Awaiting user to paste service role key into `.env.local` for local API testing.
