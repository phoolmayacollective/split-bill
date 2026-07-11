# Milestone 9: Ower decrypt & payment summary

**Status:** `completed`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestones 6, 7, 8  
**Completed:** 2026-07-11

## Goal

Ower auto-unlocks from URL fragment (or manual password entry); sees decrypted payment details on summary.

## Tasks

- [x] Read `location.hash` on bill load → strip `#` → password
- [x] If no fragment, show password prompt
- [x] `GET /api/bills/[id]` returns ciphertext fields only
- [x] Client decrypt payment details locally on summary page
- [x] Show PayPal/IBAN on summary alongside amount owed
- [x] Copy-to-clipboard for payment details
- [x] Handle wrong password gracefully

## Maps to ower flow (plan)

1. Open link → auto-unlock from fragment
2. … claim items …
3. Summary shows amount + decrypted payment details (client-side only)

## Acceptance criteria

- Server never sees password
- Payment details never in API response as plaintext
- Ower sees correct payment info after decrypt

---

## What was done

| Area | Deliverable |
|------|-------------|
| Password capture | `lib/bill-password.ts` — hash read, `sessionStorage` per bill |
| Bill layout | `app/bill/[id]/layout.tsx` + `CaptureBillPassword` on all ower routes |
| API | `toPublicBill()` returns ciphertext fields when present (no plaintext) |
| Summary UI | `components/ower-summary-page.tsx` — fetch bill, decrypt, show PayPal/IBAN |
| Password prompt | `components/bill-password-prompt.tsx` when hash missing or wrong |
| Copy actions | `components/copy-value-button.tsx` for PayPal and IBAN |

## How it was done

1. **Hash → session** — `CaptureBillPassword` syncs `#password` from the URL into `sessionStorage` on load and `hashchange`, so client navigations (name → items → summary) keep the password without re-sending it to the server.
2. **API shape** — `toPublicBill()` now includes `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations` when set; plaintext PayPal/IBAN never leave the browser.
3. **Summary decrypt** — `OwerSummaryPage` fetches bill + summary in parallel; if ciphertext exists, auto-decrypts with stored password or shows `BillPasswordPrompt`; wrong password surfaces a clear retry message.
4. **Pay the payer block** — Decrypted details render with per-field copy buttons next to the amount owed breakdown.
5. **Shared hash helper** — `share-bill-content.tsx` reuses `readPasswordFromHash()` from `lib/bill-password.ts`.
6. **Verification** — `npm test`, `npm run build`, `npm run lint`.

## Updates

- **2026-07-11:** Milestone completed. Ower summary decrypts payment details client-side; password stays in URL fragment and sessionStorage only.
