# Milestone 13: Payer edit token & bill lifecycle

**Status:** `pending`  
**Phase:** 4 — Polish  
**Depends on:** Milestone 8

## Goal

Let payer re-edit bills, expire old bills, and delete on request.

## Tasks

- [ ] Payer `editToken` in URL fragment (like password) for write access
- [ ] `PATCH /api/bills/[id]` requires valid edit token
- [ ] Bill auto-expiry (e.g. 90 days) — `expires_at` column + cleanup
- [ ] "Delete this bill" action for payer (GDPR-friendly)
- [ ] Rate limiting on bill creation API
- [ ] Document link = credential trade-off in UI

## Open questions (from plan)

- How does payer re-edit? → `editToken` in fragment
- Abuse/spam → rate limit + expiry
- GDPR → zero-knowledge + delete + auto-expiry

## Acceptance criteria

- Payer with edit token can fix items after sharing
- Expired bills return 410 or friendly message

## Updates

<!-- dated notes -->
