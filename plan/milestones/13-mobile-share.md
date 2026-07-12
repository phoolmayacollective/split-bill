# Milestone 13: Mobile UX & share tools

**Status:** `completed`  
**Completed:** 2026-07-12  
**Phase:** 4 — Polish  
**Depends on:** Milestone 9

## Goal

Mobile refinements and easier sharing for payers.

## Tasks

- [x] Large tap targets, sticky CTAs on mobile
- [x] Copy-to-clipboard for share link (with fragment)
- [x] QR code for share link on payer share page
- [x] Optional: separate-password mode (link without `#`, password via other channel)
- [x] Loading and error states across all pages
- [x] Empty states and helpful copy

## Acceptance criteria

- Full flows usable one-handed on phone
- Payer can share via copy or QR

---

## What was done

| Area | Deliverable |
|------|-------------|
| Design system | Warm OKLCH tokens, Geist font fix, `shadow-card`, safe-area sticky footers in `app/globals.css` |
| Layout primitives | `PageShell`, `PageHeader`, `StepIndicator`, `SectionCard`, `StickyActionBar` under `components/layout/` |
| Feedback | `LoadingState`, `EmptyState`, `ErrorMessage`, `CopyField` + `useCopyToClipboard`; branded `app/loading.tsx`, `error.tsx`, `not-found.tsx` |
| Payer flow | Landing, create hub, manual entry, payment, payer dashboard refresh; step indicators; collection progress bar |
| Ower flow | Bill context card, whole-row item selection, summary payment-first layout; fixed ower “I've paid” auth header |
| Share | `CopyField` with Web Share API fallback; `ShareQrCode` on payer share card; separate-password toggle |
| Landing | “Have a link?” paste field, “How it works” steps |

## How it was done

1. Introduced shared layout/feedback components and warm tokens without changing API or crypto behavior.
2. Refactored payer and ower pages to use `PageShell` / `StepIndicator` / `SectionCard`; normalized inputs to 44px height.
3. Added route-level loading/error/404 and skeleton loading on payer dashboard poll.
4. Added `components/share-qr-code.tsx` using `react-qr-code` — encodes the active share URL (with or without `#password` depending on mode).
5. Extended `ShareBillContent` with a “Send password separately” checkbox — when enabled, copies link without fragment and shows a second `CopyField` for the password; owers already prompt via `BillPasswordPrompt` when hash is missing.
6. Fixed bill refresh recursion — `useOwerSession` defers name read until after mount; payer dashboard polls every 30s (visible tab only) and skips re-render when view signature unchanged.
7. Verified with `npm test` (41 tests), `npm run build`; lint has pre-existing errors in unrelated files.

## Updates

- **2026-07-11:** Started warm-modern UI/UX refresh across completed flows. Copy/share, sticky footers, loading/empty states, and mobile tap targets done; QR and separate-password mode still pending.
- **2026-07-12:** Fixed bill refresh recursion — `useOwerSession` defers name read until after mount; payer dashboard polls every 30s (visible tab only) and skips re-render when view signature unchanged.
- **2026-07-12:** Milestone completed. QR code on payer share card; separate-password toggle for link-only sharing with password via another channel.
