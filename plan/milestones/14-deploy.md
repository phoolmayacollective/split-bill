# Milestone 14: Deploy MVP

**Status:** `pending`  
**Phase:** 4 — Polish  
**Depends on:** Milestones 9, 11

## Goal

Ship to Vercel with Supabase connected; verify full flows in production.

## Tasks

- [ ] Production env vars on Vercel
- [ ] Deploy to Vercel
- [ ] Smoke test payer flow (manual → payment → share)
- [ ] Smoke test ower flow (fragment unlock → claim → summary + payment)
- [ ] Verify DB has ciphertext only for payment fields
- [ ] Mobile test on real device

## Test checklist

- [ ] Payer: manual bill → encrypt payment → share link with `#password`
- [ ] Ower: open link → name → claim → summary with amount + PayPal/IBAN
- [ ] Two owers split shared item correctly
- [ ] Wrong password / missing fragment handled
- [ ] Server never logs or stores plaintext payment details

## Acceptance criteria

- MVP live; both personas complete flows in production

## Updates

<!-- dated notes -->
