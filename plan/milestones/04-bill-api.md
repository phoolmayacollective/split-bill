# Milestone 4: Bill & claims API

**Status:** `pending`  
**Phase:** 1 — Core flow  
**Depends on:** Milestones 2, 3

## Goal

API routes for creating bills, fetching them, and recording ower claims.

## Tasks

- [ ] `POST /api/bills` — create bill (items, totals; payment fields null in phase 1)
- [ ] `GET /api/bills/[id]` — return bill + existing claims (no payment ciphertext use yet)
- [ ] `POST /api/bills/[id]/claims` — ower name + item claims
- [ ] `GET /api/bills/[id]/summary` — computed totals per ower (no payment details in phase 1)
- [ ] Zod validation on all payloads
- [ ] Error handling (404, 400)

## Acceptance criteria

- Payer can POST a manual bill and get `billId`
- Ower can POST claims and GET summary with correct amounts

## Updates

<!-- dated notes -->
