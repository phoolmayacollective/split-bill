# Milestone 17: Dal Bhat restaurant menu

**Status:** `completed`  
**Completed:** 2026-07-12  
**Phase:** 5 — Restaurant menus  
**Depends on:** Milestone 4, 5, 8

## Goal

Restaurant-specific bill creation from a static Dal Bhat menu — pick items with variants, search/filter the menu, then reuse the existing payer payment → share flow.

## Tasks

- [x] `data/restaurants/dalbhat-menu.json` — static menu database (food + drinks, options, momo pricing, drink sizes)
- [x] `lib/restaurants/dalbhat-menu.ts` — typed menu model, category labels, `buildBillItemId()`
- [x] `lib/restaurants/format-euro.ts` — EUR display via `Intl.NumberFormat("de-DE")`
- [x] `lib/restaurants/dalbhat-menu-search.ts` — text search + category filter across all menu sections
- [x] `app/restaurant/dalbhat/page.tsx` — URL-only route (no home page link)
- [x] `components/restaurant/dalbhat-bill-form.tsx` — full menu picker, cart, tax/tip, participant roster
- [x] `components/restaurant/menu-controls.tsx` — `QtyControls`, `EuroAmount`
- [x] `components/restaurant/menu-search-filter.tsx` — sticky search bar + category chips
- [x] POST `/api/bills` → redirect to `/create/{id}/payment` → share (existing M8 flow)
- [x] Momo: filling + style selection, 6pc/10pc portions, order qty
- [x] Drinks: single-price items and multi-size pricing
- [x] Menu items with optional add-ons (e.g. chicken +€1)

## Acceptance criteria

- Payer opens `/restaurant/dalbhat`, selects items (including variants/options), and creates a bill
- Cart totals update live; tax/tip optional; bill posts to existing API
- After submit, payer lands on encrypted payment step then share link — same as manual create
- Menu is searchable by name/description and filterable by category
- Prices display in EUR

---

## What was done

| Area | Deliverable |
|------|-------------|
| Menu data | `data/restaurants/dalbhat-menu.json` — full Dal Bhat menu: small plates, recommendations, classics, dalbhat, momo, desserts, extras, drinks (tea through wine) |
| Menu lib | `lib/restaurants/dalbhat-menu.ts` — `MenuItem`, `RecommendationItem`, `MomoStyle`, `DrinkItem` types; `dalbhatMenu` import; `CATEGORY_LABELS` / `DRINK_CATEGORY_LABELS`; `formatMenuItemName()`, `buildBillItemId()` |
| EUR format | `lib/restaurants/format-euro.ts` — `formatEuro()` for de-DE currency display |
| Search/filter | `lib/restaurants/dalbhat-menu-search.ts` — `filterDalbhatMenu()`, `MENU_FILTER_OPTIONS`, `isMenuFiltered()`; searches DE/EN names, descriptions, allergens, options |
| Route | `app/restaurant/dalbhat/page.tsx` — server page with metadata; renders `DalbhatBillForm` (not linked from home) |
| Bill form | `components/restaurant/dalbhat-bill-form.tsx` — category sections, option checkboxes, momo builder (filling × style × portion × qty), drink size picker, cart review, `ParticipantListEditor`, sticky submit |
| UI controls | `components/restaurant/menu-controls.tsx` — shared `QtyControls` (+/−) and `EuroAmount` |
| Search UI | `components/restaurant/menu-search-filter.tsx` — sticky search input, horizontal category tabs, result count |
| API reuse | Cart → `cartToBillItems()` → `POST /api/bills` with `buildTotals()` → `router.push(/create/{id}/payment)` |

## How it was done

1. **Static menu** — encoded the Dal Bhat menu as JSON with typed categories; food items support `options[]` for surcharges; recommendations use portion-based pricing; momo has fillings, styles, and 6pc/10pc price tiers; drinks support flat price or `sizes[]`.
2. **Menu helpers** — `dalbhat-menu.ts` exports types and label maps; `buildBillItemId(category, itemId, variant?)` produces stable bill line IDs for cart deduplication.
3. **Search** — `filterDalbhatMenu(query, activeFilter)` normalizes query, matches across bilingual text and metadata per section, and returns a `FilteredDalbhatMenu` with `resultCount` / `hasResults`.
4. **Picker UI** — `DalbhatBillForm` maintains a `CartLine[]` keyed by variant; `QtyControls` increment/decrement per line; option checkboxes add `extra_charge` to price; momo section combines filling + style + portion before qty; drinks render size buttons when `sizes` present.
5. **Submit flow** — reuses `lib/bill-totals.ts` (`calculateSubtotal`, `buildTotals`); optional participant roster; POST to existing `/api/bills`; on success redirects to M8 payment step (not share directly).
6. **EUR display** — restaurant page uses `formatEuro` / `EuroAmount` instead of generic currency helpers.
7. **Discovery** — route is URL-only (`/restaurant/dalbhat`); no link from landing or create hub.

## Key files

```
data/restaurants/dalbhat-menu.json
lib/restaurants/dalbhat-menu.ts
lib/restaurants/format-euro.ts
lib/restaurants/dalbhat-menu-search.ts
app/restaurant/dalbhat/page.tsx
components/restaurant/dalbhat-bill-form.tsx
components/restaurant/menu-controls.tsx
components/restaurant/menu-search-filter.tsx
```

## Updates

- **2026-07-12:** Milestone completed. Dal Bhat menu picker with search/filter, variant pricing, momo portions, drink sizes; plugs into existing bill → payment → share flow.
