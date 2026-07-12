# Bill Splitter — Plan folder

| File | Purpose |
|------|---------|
| [bill-splitter-plan.md](./bill-splitter-plan.md) | Full product & technical plan |
| [MILESTONES.md](./MILESTONES.md) | Milestone index, progress, and **completed work log** |
| [milestones/](./milestones/) | One file per milestone — each completed one has **What was done** + **How** |

## Current progress

**13 / 18 milestones completed** · **3 in progress** (M14–M16)

Milestones are numbered in **chronological build order** (M1–M13 done, M14–M16 active, M17–M18 planned).

| # | Status | Milestone | Summary |
|---|--------|-----------|---------|
| 1 | ✅ | Bootstrap | Next.js 16 + shadcn/ui + Supabase client stub |
| 2 | ✅ | Database | `bills`/`claims` tables via Supabase MCP + `lib/db/bills.ts` |
| 3 | ✅ | Split logic | `lib/split.ts` + unit tests (`npm test`) |
| 4 | ✅ | Bill API | `POST/GET /api/bills`, claims + summary routes |
| 5 | ✅ | Payer UI | Manual bill entry, share link with copy |
| 6 | ✅ | Ower UI | Name → claim items → summary total |
| 7 | ✅ | Client crypto | PBKDF2 + AES-GCM encrypt/decrypt in `lib/crypto.ts` |
| 8 | ✅ | Encrypted payment | PayPal/IBAN encrypt on create, share link with `#password` |
| 9 | ✅ | Ower decrypt | Summary decrypts payment details client-side; copy PayPal/IBAN |
| 10 | ✅ | Payer bill view & roster | Item progress bars, mark paid, participant roster at create |
| 11 | ✅ | Shared-item polish | Unit-level splits, explicit split count, fractional payer progress |
| 12 | ✅ | Dal Bhat menu | `/restaurant/dalbhat` fuzzy-searchable menu picker with highlighted matches → bill → payment → share |
| 13 | ✅ | Mobile UX & share | Warm UI, sticky CTAs, copy/Web Share, QR code, separate-password mode |
| 14 | 🔄 | Account dashboards | Optional username save; payer circle + dashboard UI pending |
| 15 | 🔄 | Demo video | Playwright silent walkthrough; WaveNet narrated MP4 (GCP credentials pending) |
| 16 | 🔄 | Receipt scan | Tesseract.js browser OCR spike — `/create/scan`, heuristic parse, LLM text step TBD |
| 17 | ⏳ | Bill lifecycle | Payer edit token & bill expiry |
| 18 | ⏳ | Deploy MVP | Vercel + production smoke tests |

See [MILESTONES.md](./MILESTONES.md) for the full log and [milestones/](./milestones/) for step-by-step details.

## Milestones map to plan phases

```
Phase 1 (core flow)      → M1–M6
Phase 2 (zero-knowledge) → M7–M10
Phase 3 (OCR)            → M16
Phase 4 (polish & ship)  → M11, M13, M14, M17, M18
Phase 5 (restaurants)    → M12
Phase 6 (demo tooling)   → M15
```
