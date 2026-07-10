# Milestone 7: Client-side crypto

**Status:** `pending`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestone 1

## Goal

Browser-only encryption using Web Crypto API — no password or key on server.

## Tasks

- [ ] `lib/crypto.ts` — `encryptPaymentDetails(password, details)` / `decryptPaymentDetails(password, ciphertext, iv, salt, iterations)`
- [ ] PBKDF2 key derivation via `crypto.subtle.deriveKey`
- [ ] AES-GCM encrypt/decrypt via `crypto.subtle`
- [ ] Random salt + IV generation
- [ ] Base64 encode/decode for storage transport
- [ ] Unit tests in browser or jsdom

## Security requirements

- Password never sent to server
- Server only ever receives ciphertext, iv, salt, iterations

## Acceptance criteria

- Round-trip encrypt → decrypt with same password works in browser
- Wrong password fails decrypt

## Updates

<!-- dated notes -->
