# Milestone 8: Encrypted payment flow (payer)

**Status:** `completed`  
**Phase:** 2 — Zero-knowledge payment  
**Depends on:** Milestones 5, 7  
**Completed:** 2026-07-11

## Goal

Payer adds PayPal/IBAN; browser encrypts; only ciphertext stored server-side.

## Tasks

- [x] `app/create/[billId]/payment/page.tsx` — PayPal and/or IBAN fields
- [x] Generate or let payer set password before encrypt
- [x] Client encrypt → include `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations` in bill PATCH/POST
- [x] Update `POST /api/bills` or add `PATCH /api/bills/[id]` for encrypted payment fields
- [x] Share page shows link: `/bill/{id}#{password}`
- [x] Copy button for full link (including fragment)
- [x] Document: link = credential; anyone with full link can decrypt

## Maps to payer flow (plan)

4. Add payment details
5. Browser encrypts
6. POST ciphertext → server returns billId
7. Share link with `#password` fragment

## Acceptance criteria

- DB contains only ciphertext — no plaintext PayPal/IBAN
- Share link includes `#password` fragment

---

## What was done

| Area | Deliverable |
|------|-------------|
| Payment UI | `app/create/[billId]/payment/page.tsx` + `components/payment-form.tsx` |
| Encrypt flow | Client-side `encryptPaymentDetails()` → `PATCH /api/bills/[id]` |
| API | `updateBillPaymentSchema` + PATCH handler; public GET still omits ciphertext |
| Password | Auto-generated via `lib/share-password.ts`; payer can edit or regenerate |
| Share link | `components/share-bill-content.tsx` reads `#password` from URL hash (embedded on payer page) |
| URL helpers | `lib/share-url.ts` — builds `/bill/{id}#{password}` for copy |
| Payer flow | Manual create → `/create/{id}/payment` → `/bill/{id}/payer#password` |

## How it was done

1. **Two-step create** — `POST /api/bills` (items only) unchanged; manual page redirects to `/create/{billId}/payment` instead of share.
2. **Payment form** — collects PayPal and/or IBAN plus link password; encrypts in browser with M7 helpers; PATCHes only ciphertext fields to the server.
3. **PATCH API** — `updateBillPaymentSchema` validates `payment_enc`, `payment_iv`, `payment_salt`, `kdf_iterations`; `updateBill()` persists to Supabase.
4. **Share link UI** — `ShareBillContent` uses `useSyncExternalStore` to read URL hash client-side; `CopyShareLink` copies full URL including `#password`; security note explains link = credential. *(M10: `/bill/{id}/share` redirects to payer view; copy UI lives on `/bill/{id}/payer`.)*
5. **Verified** — `npm test`, `npm run lint`, `npm run build`; curl create + PATCH + GET confirms ciphertext stored and not exposed in public API.

## Key files

```
lib/api/schemas.ts              # updateBillPaymentSchema
lib/share-url.ts
lib/share-password.ts
app/api/bills/[id]/route.ts     # PATCH handler
app/create/[billId]/payment/page.tsx
app/create/manual/page.tsx      # redirect to payment step
components/payment-form.tsx
components/share-bill-content.tsx
app/bill/[id]/share/page.tsx
```

## Updates

- **2026-07-11:** Started M8 — encrypted payment flow for payer.
- **2026-07-11:** Milestone completed. Payer encrypts PayPal/IBAN client-side; share link includes `#password` fragment.
- **2026-07-11:** Share route now redirects to payer bill view (M10); `ShareBillContent` moved to `/bill/{id}/payer`.

## Design notes — `useSyncExternalStore` (2026-07-11)

`ShareBillContent` reads the link password from `window.location.hash` via `useSyncExternalStore`. Notes from implementation review:

### Why this hook

The `#password` fragment is **never sent to the server** (RFC 3986). The share page must read it client-side to build the full copy URL (`/bill/{id}#{password}`).

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` is React’s recommended way to subscribe to external browser state:

| Argument | Role in M8 |
|----------|------------|
| `subscribeToHashChange` | Listen for `hashchange` |
| `readPasswordFromHash` | Sync read of `window.location.hash` on client |
| `() => ""` | Server snapshot — no hash during SSR |

Avoids `useEffect` + `setState` for derived hash data (extra render, `react-hooks/set-state-in-effect` lint).

### API / DB data — not a direct fit

Backend DB is external, but HTTP `fetch` is **async** — no instant snapshot at subscribe time. Flow:

```
DB → API route → fetch (async) → client cache → React UI
```

Use server components / `getBillById()` for initial page data (as elsewhere in this app). Use `fetch` + `useState` or TanStack Query/SWR for client fetches. Libraries like React Query use `useSyncExternalStore` internally against their **cache**, not against raw `fetch`.

### `localStorage` / `sessionStorage` — good fit, with a caveat

Synchronous reads (`getItem`) make storage a natural external store. **Subscribe caveat:** the native `storage` event only fires for changes from **other tabs**, not the same tab. For same-tab reactivity, wrap writes to dispatch a custom event.

This project uses **`sessionStorage`** for ower name (`lib/ower-session.ts`), not `localStorage`:

- Read once on mount via `useState(() => getOwerName(billId))` — sufficient because name is set on the name page then user **navigates** to items/summary (remount reads fresh value).
- `sessionStorage` is tab-scoped and cleared when the tab closes — right for temporary per-bill session state.
- `useSyncExternalStore` would only be needed if multiple components on the **same page** had to stay in sync with storage writes without navigation.

### When to use what (this app)

| Data source | Pattern |
|-------------|---------|
| URL hash (`#password`) | `useSyncExternalStore` — `components/share-bill-content.tsx` |
| Bill items / claims (server-known) | Server component + `getBillById()` |
| Form mutations (create bill, PATCH payment) | Client `fetch` + redirect |
| Ower name (tab session) | `sessionStorage` get/set + read on mount — `lib/ower-session.ts` |
| Cross-tab or live same-tab storage sync | `useSyncExternalStore` + storage wrapper with custom event |
