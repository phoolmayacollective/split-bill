# Bill Splitter — Plan folder

| File | Purpose |
|------|---------|
| [bill-splitter-plan.md](./bill-splitter-plan.md) | Full product & technical plan |
| [MILESTONES.md](./MILESTONES.md) | Milestone index, progress, and **completed work log** |
| [milestones/](./milestones/) | One file per milestone — each completed one has **What was done** + **How** |

## Current progress

**6 / 14 milestones completed** (Phase 1 complete)

| Done | Milestone | Summary |
|------|-----------|---------|
| ✅ | M1 Bootstrap | Next.js 16 + shadcn/ui + Supabase client stub |
| ✅ | M2 Database | `bills`/`claims` tables via Supabase MCP + `lib/db/bills.ts` |
| ✅ | M3 Split logic | `lib/split.ts` + unit tests (`npm test`) |
| ✅ | M4 Bill API | `POST/GET /api/bills`, claims + summary routes |
| ✅ | M5 Payer UI | Manual bill entry, share link with copy |
| ✅ | M6 Ower UI | Name → claim items → summary total |
| ⏳ | M7 Client crypto | Next up (Phase 2) |

See [MILESTONES.md](./MILESTONES.md) for the full log and [milestones/](./milestones/) for step-by-step details.

## Milestones map to plan phases

```
Phase 1 (core flow)     → M1–M6
Phase 2 (zero-knowledge)→ M7–M9
Phase 3 (OCR)           → M10
Phase 4 (polish)        → M11–M14
```
