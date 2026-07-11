# Bill Splitter — Plan folder

| File | Purpose |
|------|---------|
| [bill-splitter-plan.md](./bill-splitter-plan.md) | Full product & technical plan |
| [MILESTONES.md](./MILESTONES.md) | Milestone index, progress, and **completed work log** |
| [milestones/](./milestones/) | One file per milestone — each completed one has **What was done** + **How** |

## Current progress

**10 / 16 milestones completed** · **2 in progress** (M13 UI/UX, M16 account stub) · next up **M11 OCR**

| Done | Milestone | Summary |
|------|-----------|---------|
| ✅ | M1 Bootstrap | Next.js 16 + shadcn/ui + Supabase client stub |
| ✅ | M2 Database | `bills`/`claims` tables via Supabase MCP + `lib/db/bills.ts` |
| ✅ | M3 Split logic | `lib/split.ts` + unit tests (`npm test`) |
| ✅ | M4 Bill API | `POST/GET /api/bills`, claims + summary routes |
| ✅ | M5 Payer UI | Manual bill entry, share link with copy |
| ✅ | M6 Ower UI | Name → claim items → summary total |
| ✅ | M7 Client crypto | PBKDF2 + AES-GCM encrypt/decrypt in `lib/crypto.ts` |
| ✅ | M8 Encrypted payment | PayPal/IBAN encrypt on create, share link with `#password` |
| ✅ | M9 Ower decrypt | Summary decrypts payment details client-side; copy PayPal/IBAN |
| ✅ | M10 Payer bill view & roster | Item progress bars, mark paid, participant roster at create |
| 🔄 | M13 Mobile UX & share | Warm UI refresh, sticky CTAs, copy/share, loading states (QR pending) |
| 🔄 | M16 Account dashboards | Optional username save after bill; dashboard UI pending |
| ⏳ | M11 Receipt scan | Next feature milestone (Phase 3) |

See [MILESTONES.md](./MILESTONES.md) for the full log and [milestones/](./milestones/) for step-by-step details.

## Milestones map to plan phases

```
Phase 1 (core flow)     → M1–M6
Phase 2 (zero-knowledge)→ M7–M10
Phase 3 (OCR)           → M11
Phase 4 (polish)        → M12–M16
```
