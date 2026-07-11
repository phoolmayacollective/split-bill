# Milestone 7: Client-side crypto

**Status:** `completed`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestone 1  
**Completed:** 2026-07-11

## Goal

Browser-only encryption using Web Crypto API — no password or key on server.

## Tasks

- [x] `lib/crypto.ts` — `encryptPaymentDetails(password, details)` / `decryptPaymentDetails(password, ciphertext, iv, salt, iterations)`
- [x] PBKDF2 key derivation via `crypto.subtle.deriveKey`
- [x] AES-GCM encrypt/decrypt via `crypto.subtle`
- [x] Random salt + IV generation
- [x] Base64 encode/decode for storage transport
- [x] Unit tests in browser or jsdom

## Security requirements

- Password never sent to server
- Server only ever receives ciphertext, iv, salt, iterations

## Acceptance criteria

- Round-trip encrypt → decrypt with same password works in browser
- Wrong password fails decrypt

---

## What was done

| Area | Deliverable |
|------|-------------|
| Types | `PaymentDetails`, `EncryptedPayment` in `lib/crypto.ts` |
| Encrypt | `encryptPaymentDetails()` — PBKDF2 (100k iter) + AES-GCM-256, random salt/IV, base64 output |
| Decrypt | `decryptPaymentDetails()` — derives key, decrypts JSON payment details |
| Tests | `lib/crypto.test.ts` — round-trip, wrong password, partial details |

## How it was done

1. **Web Crypto only** — `crypto.subtle` for PBKDF2-SHA256 key derivation and AES-GCM encrypt/decrypt; no third-party crypto library.
2. **Payload** — `PaymentDetails` JSON (`paypal?`, `iban?`) encrypted as UTF-8; stored fields match DB columns (`payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations`).
3. **Transport encoding** — portable `btoa`/`atob` helpers for base64; 16-byte salt, 12-byte IV (GCM standard).
4. **TypeScript** — `copyBytes()` wrapper for `BufferSource` compatibility with strict DOM lib types.
5. **Verified** — `npm test` (9 tests), `npm run lint`, `npm run build`.

## Key files

```
lib/crypto.ts
lib/crypto.test.ts
package.json          # test script includes crypto tests
```

## Updates

- **2026-07-11:** Started M7 — Phase 2 client-side crypto.
- **2026-07-11:** Milestone completed. PBKDF2 + AES-GCM helpers with round-trip and wrong-password tests.
