# Milestone 9: Ower decrypt & payment summary

**Status:** `pending`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestones 6, 7, 8

## Goal

Ower auto-unlocks from URL fragment (or manual password entry); sees decrypted payment details on summary.

## Tasks

- [ ] Read `location.hash` on bill load → strip `#` → password
- [ ] If no fragment, show password prompt
- [ ] `GET /api/bills/[id]` returns ciphertext fields only
- [ ] Client decrypt payment details locally on summary page
- [ ] Show PayPal/IBAN on summary alongside amount owed
- [ ] Copy-to-clipboard for payment details
- [ ] Handle wrong password gracefully

## Maps to ower flow (plan)

1. Open link → auto-unlock from fragment
2. … claim items …
3. Summary shows amount + decrypted payment details (client-side only)

## Acceptance criteria

- Server never sees password
- Payment details never in API response as plaintext
- Ower sees correct payment info after decrypt

## Updates

<!-- dated notes -->
