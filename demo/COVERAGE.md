# Demo coverage & feature inventory

Last updated: 2026-07-12

Reference for what the automated demo shows vs what the app has shipped. Sources: `plan/MILESTONES.md`, route/component code, `e2e/demo-walkthrough.spec.ts`, `demo/scenes.json`.

---

## Personas

### Demo personas (defined in code)

| Key | Banner label | Role | Scenes |
|-----|--------------|------|--------|
| `overview` | **Product demo** | Narrator / landing | Scene 1 — landing |
| `payer` | **Payer · Alex** | Creates bill, adds payment, shares, tracks collection | Scenes 2–5, 10, 12 |
| `ower` | **Ower · Sam** | Opens share link, claims items, sees payment | Scenes 6–8 |
| `owerJordan` | **Ower · Jordan** | Second claimant, joins split, self-reports paid | Scenes 9, 11 |
| `restaurant` | **Restaurant · Alex** | Dal Bhat menu bill create | Scene 13 |

Defined in `e2e/demo-helpers.ts` (`DEMO_PERSONAS`) and `demo/scenes.json`.

### App personas (implied by flows, not all in demo)

| Persona | In demo? | Notes |
|---------|----------|-------|
| **Alex** (payer) | Yes | Creates bill, encrypts payment, watches collection |
| **Sam** (ower) | Yes | Picks name from roster, claims items, copies PayPal |
| **Jordan** (ower) | Yes | Joins split, self-reports paid |
| **Guest payer** | Partial | Default path — no account; demo doesn't show optional account save (M15) |
| **Restaurant payer** | Yes | Dal Bhat menu flow (`/restaurant/dalbhat`) |

**Still missing for a complete demo:** optional account save (M15).

---

## Completed features (12 / 18 milestones)

### Phase 1 — Core flow (M1–M6) ✅

| Feature | Route / component |
|---------|-------------------|
| Landing page + “How it works” | `/`, `HowItWorks` |
| Open existing bill link | `/`, `OpenBillLink` |
| Manual bill create (items, tax, tip) | `/create/manual`, `BillItemEditor` |
| Participant roster at create | `ParticipantListEditor` |
| Encrypted payment step (PayPal/IBAN + password) | `/create/[id]/payment`, `PaymentForm` |
| Share link with `#password` | `ShareBillContent`, `CopyField` |
| Payer dashboard (collection + item progress) | `/bill/[id]/payer`, `PayerBillPage` |
| Ower name step (roster or custom) | `/bill/[id]/name`, `OwerNameForm` |
| Ower item claiming | `/bill/[id]/items`, `OwerItemPicker` |
| Ower summary + “I've paid” | `/bill/[id]/summary`, `OwerSummaryPage` |
| REST API (bills, claims, summary, paid) | `app/api/bills/*` |

### Phase 2 — Zero-knowledge payment (M7–M10) ✅

| Feature | Notes |
|---------|-------|
| Client-side AES-GCM encrypt/decrypt | `lib/crypto.ts` — password never hits server |
| Auto-decrypt from URL `#password` | `CaptureBillPassword`, `lib/bill-password.ts` |
| Manual password fallback | `BillPasswordPrompt` |
| Per-item settlement progress bars | Payer dashboard |
| Payer can mark ower paid | Alternative to self-report |
| Ower self-reports “I've paid” | Updates payer view |

### Phase 4 — Split polish (M11) ✅

| Feature | Notes |
|---------|-------|
| Multi-qty items → individual unit rows | `lib/bill-units.ts` |
| “Split with N people” per unit | `lib/claim-units.ts` |
| Fractional payer progress | Segmented bars on dashboard |
| Proportional tax/tip on claims | `lib/split.ts` |
| Payer dashboard auto-refresh (30s poll) | `PayerBillPage` |

### Phase 5 — Restaurant menu (M12) ✅

| Feature | Route |
|---------|-------|
| Dal Bhat searchable menu + cart | `/restaurant/dalbhat`, `DalbhatBillForm` |
| Momo portions, drink sizes, add-ons | Menu JSON + picker |
| Same payment → share flow as manual | Reuses M8 |

### In progress (not complete)

| Milestone | Status | What exists |
|-----------|--------|-------------|
| **M13** Mobile UX & share | `in_progress` | UI refresh, copy/Web Share — QR & separate-password still open |
| **M14** Demo video | `in_progress` | Silent walkthrough works; narrated MP4 needs GCP creds |
| **M15** Account dashboards | `in_progress` | Optional username save stub — no dashboard list UI |

### Pending (not built)

| Milestone | Feature |
|-----------|---------|
| **M16** | Receipt scan (OCR) — UI stub only (“coming soon”) |
| **M17** | Payer edit token & bill lifecycle |
| **M18** | Deploy MVP |

---

## Current demo walkthrough (13 scenes)

| # | Scene ID | Persona | What it shows |
|---|----------|---------|---------------|
| 1 | `landing` | Product demo | Home page |
| 2 | `create` | Payer · Alex | Manual create + tax/tip + participant roster |
| 3 | `payment` | Payer · Alex | Encrypted PayPal entry |
| 4 | `payer_dashboard` | Payer · Alex | Share dashboard (initial) |
| 5 | `share_link` | Payer · Alex | Copy share link |
| 6 | `ower_name` | Ower · Sam | Roster name pick |
| 7 | `ower_items` | Ower · Sam | Claim item + split with 2 |
| 8 | `ower_payment` | Ower · Sam | Decrypted PayPal + copy |
| 9 | `ower_jordan` | Ower · Jordan | Joins same split |
| 10 | `payer_progress` | Payer · Alex | Per-item progress + mark Sam paid |
| 11 | `ower_jordan_paid` | Ower · Jordan | “I've paid” self-report |
| 12 | `payer_update` | Payer · Alex | “2/2 people paid” |
| 13 | `dalbhat` | Restaurant · Alex | Dal Bhat menu search + cart |

**Covered end-to-end:** Landing → manual create + tax/tip + participants → encrypted payment → payer dashboard → copy share link → ower roster name → claim + split → decrypted payment + copy → second ower joins split → payer progress + mark paid → ower self-report → collection update → Dal Bhat menu.

---

## Demo gaps (completed features not shown)

| Completed feature | Demo status |
|-------------------|-------------|
| Tax & tip entry | ✅ Shown in create |
| Copy / Web Share link | ✅ Copy shown; Web Share skipped (not available in headless Chromium) |
| Decrypted payment details + copy PayPal | ✅ Scene 8 |
| “Split with N people” | ✅ Scene 7 |
| Second ower (Jordan) | ✅ Scenes 9, 11 |
| Payer “Mark paid” (vs ower self-report) | ✅ Both shown (scenes 10–11) |
| Dal Bhat restaurant menu | ✅ Scene 13 (menu + cart; payment not repeated) |
| Open bill link on landing | ❌ Skipped |
| Optional account save | ❌ M15 stub not shown |
| Per-item progress bars detail | ✅ Scene 10 |
| `/create` hub | ❌ Demo goes straight to `/create/manual` |
| Multi-qty unit rows | ~ Split-with-N shown instead |
| Manual password entry | ❌ Auto via hash only |
| IBAN payment type | ❌ Demo uses PayPal only |

---

## Milestone status summary

| Status | Count | Milestones |
|--------|-------|------------|
| Completed | 12 | M1–M12 |
| In progress | 3 | M13, M14, M15 |
| Pending | 3 | M16, M17, M18 |
