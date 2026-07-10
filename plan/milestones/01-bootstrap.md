# Milestone 1: Project bootstrap

**Status:** `completed`  
**Phase:** 1 — Core flow  
**Depends on:** —  
**Completed:** 2026-07-10

## Goal

Initialize Next.js, Tailwind, shadcn/ui, and Supabase so later milestones have a foundation.

## Tasks

- [x] `create-next-app` — TypeScript, Tailwind, ESLint, App Router
- [x] Initialize shadcn/ui
- [x] Install `@supabase/supabase-js`, `zod`, `nanoid`
- [x] Add `.env.example` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`)
- [x] Create `lib/supabase.ts` (server-side client)
- [x] Verify `npm run dev` runs

## Acceptance criteria

- Dev server starts without errors
- Folder structure ready: `app/`, `lib/`, `components/`

---

## What was done

| Area | Deliverable |
|------|-------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| UI kit | shadcn/ui v4 with Button component |
| Dependencies | `@supabase/supabase-js`, `zod`, `nanoid` |
| Config | `.env.example`, `.gitignore` (allows `.env.example`) |
| Server client | `lib/supabase.ts` — typed Supabase client (service role) |
| Pages | Landing (`/`), placeholder create flow (`/create`) |
| Package | Renamed to `split-bill` in `package.json` |

## How it was done

1. **Next.js scaffold** — `create-next-app` failed on the workspace folder name (`split bill` has a space). Workaround: scaffolded into a `web/` subfolder, then moved files to project root.
2. **shadcn/ui** — `npx shadcn@latest init --defaults --force` added `components.json`, `components/ui/button.tsx`, `lib/utils.ts`, and updated `app/globals.css`.
3. **Dependencies** — `npm install @supabase/supabase-js zod nanoid`.
4. **Supabase client** — `lib/supabase.ts` reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env; throws if missing. Client is server-only (no session persistence).
5. **Landing page** — Replaced default Next.js template with a mobile-first home page and link to `/create`. Used `buttonVariants()` on a `Link` (shadcn v4 Button has no `asChild` prop).
6. **Verification** — `npm run build` and `npm run lint` both pass.

## Key files created

```
app/page.tsx              # Landing — "Create a bill"
app/create/page.tsx       # Placeholder for milestone 5
app/layout.tsx            # App metadata updated
lib/supabase.ts           # Server Supabase client
lib/utils.ts              # cn() helper (shadcn)
components/ui/button.tsx  # shadcn Button
.env.example              # Env var template
components.json           # shadcn config
```

## Stack versions

- next `16.2.10`
- react `19.2.4`
- tailwindcss `^4`
- @supabase/supabase-js `^2.109.0`
- shadcn `^4.13.0`

## Updates

- **2026-07-10:** Milestone completed. Next.js + shadcn/ui bootstrapped; landing and `/create` placeholder shipped; Supabase server client stubbed pending env keys.
