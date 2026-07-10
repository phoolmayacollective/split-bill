# Milestone 8: Encrypted payment flow (payer)

**Status:** `pending`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestones 5, 7

## Goal

Payer adds PayPal/IBAN; browser encrypts; only ciphertext stored server-side.

## Tasks

- [ ] `app/create/[billId]/payment/page.tsx` — PayPal and/or IBAN fields
- [ ] Generate or let payer set password before encrypt
- [ ] Client encrypt → include `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations` in bill PATCH/POST
- [ ] Update `POST /api/bills` or add `PATCH /api/bills/[id]` for encrypted payment fields
- [ ] Share page shows link: `/bill/{id}#{password}`
- [ ] Copy button for full link (including fragment)
- [ ] Document: link = credential; anyone with full link can decrypt

## Maps to payer flow (plan)

4. Add payment details
5. Browser encrypts
6. POST ciphertext → server returns billId
7. Share link with `#password` fragment

## Acceptance criteria

- DB contains only ciphertext — no plaintext PayPal/IBAN
- Share link includes `#password` fragment

## Updates

<!-- dated notes -->
