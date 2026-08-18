# JhyapOS — landing page

Marketing and product-preview site for JhyapOS, an AI-native workspace for
research and knowledge work.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion ·
Lucide · Zod. No CSS-in-JS, no component library, no 3D engine.

## How the page is put together

The page is ordered as an argument rather than a feature list — curiosity,
problem, recognition, product, conviction, ask — and each section in
`src/components/sections/` is one beat of it. `src/app/page.tsx` is the running
order and is the best place to start reading.

Two rules shape everything:

- **The product UI is the visual language.** Every workspace surface on the
  page is real markup (`src/components/workspace/`), not a screenshot. The same
  five panes appear in the hero, the workspace preview, and the research
  workflow, so it stays sharp at any density and there are no images to load.
- **The still sections carry the loud ones.** "The core problem" and "Why
  JhyapOS" have no motion at all, which is what makes the scroll-driven
  sections either side of them land.

### The logo

`src/assets/logo-mark.png` is the real app icon, copied from the product repo
(`JhyapOS/apps/web/assets/logo.png`) and kept alongside the untouched original
at `src/assets/logo-original.png`. The only edit is an alpha channel: the source
is an opaque square with the disc on a black field, which reads as a dark box on
the page, so everything outside the disc is cleared and the canvas cropped to
it. The artwork itself is byte-for-byte unchanged.

**Don't redraw it as SVG.** If the brand mark changes, replace the PNG and
re-run the same crop. `src/app/icon.png` (the favicon) is the same treatment
applied to the product's 128px icon.

`LogoMark` requests 3× its display size and scales down in CSS — sizing the
element directly makes Next serve a 1× asset, which visibly softens on retina.

### Animation

Scroll-linked sections use Motion's `useScroll` with keyframe lists that always
span the full `0 → 1` range. Motion *extrapolates* past the last input point
rather than holding it, so a list that stops early drifts back the other way for
the remainder of the scroll. If you add a scroll transform, terminate it at `1`.

Everything animated is `transform` and `opacity` only. Anything that has to
travel across a container is computed in pixels from a measured stage
(`useStageSize` in `what-if.tsx`) — a percentage `x`/`y` in Motion resolves
against the element's own box, not its parent.

### Reduced motion

`prefers-reduced-motion` is honoured in three layers: `globals.css` disables
decorative loops, `usePrefersReducedMotion` lets components render their
resolved end state instead of animating, and the two heaviest sections
(`what-if`, `not-a-chat`) have purpose-built static fallbacks that make the same
point in one screen.

### Responsiveness

Desktop is the primary experience, since JhyapOS itself is a desktop workspace.
Below `1024px` the interactive workspace stacks its panes; below `768px` the
hero shows the three panes that carry the idea instead of squeezing five into
375px, and the chaos sequence uses its own set of coordinates
(`Win.mobile`) rather than being scaled down.

## The waitlist

`POST /api/waitlist` validates with Zod, rate-limits per IP, rejects duplicates,
traps bots with a honeypot, and never leaks store internals to the client. The
same schema (`src/lib/waitlist/schema.ts`) runs on both sides, so client and
server validation can't drift.

Storage sits behind one interface — `WaitlistStore` in
`src/lib/waitlist/store.ts` — with three adapters:

| `WAITLIST_STORE` | Behaviour |
| --- | --- |
| `file` | Appends to `.data/waitlist.jsonl`. **Default in development.** |
| `postgres` | Neon / Supabase / RDS / plain Postgres. Needs `DATABASE_URL`. |
| `memory` | In-process only. Default elsewhere; **does not persist.** |

### Before you launch

The in-memory default means production signups are silently lost. Pick a real
store:

```bash
npm install pg @types/pg
```

```bash
# .env.local — never commit, never prefix with NEXT_PUBLIC_
WAITLIST_STORE=postgres
DATABASE_URL=postgres://user:password@host:5432/database
```

The table is created on first use and enforces uniqueness on `email` in the
database rather than in application code, so two concurrent signups for the same
address can't both insert.

To use something else — Airtable, a CRM, Resend, a webhook — implement
`WaitlistStore` and add a case to `getWaitlistStore()`. Nothing in the route or
the components has to change. Credentials are read on the server only; the
`server-only` guard turns a client import into a build error.

## Still to fill in

- **Social links.** `SOCIAL` in `src/components/site/footer.tsx` is deliberately
  `null` — pointing at a handle that might belong to someone else is worse than
  showing nothing. Add the real URLs and the links appear.
- **Domain.** `SITE` in `src/app/layout.tsx` and the `hello@jhyapos.com`
  addresses in the footer and legal pages.
- **Open Graph image.** No `opengraph-image` yet; add one to
  `src/app/` when there's art for it.
- **Legal pages.** `/privacy` and `/terms` describe what this site actually
  does — the waitlist fields and nothing more. They're accurate, not lawyered;
  have counsel review before launch, and replace them when the product itself
  starts handling user data.
- **Rate limiting.** In-memory and per-instance. On multi-instance or serverless
  deploys, put Redis or your platform's limiter in front.
- **Testimonials.** The early-users section makes no claims about numbers and
  borrows no logos. There's a natural slot for real quotes once they exist.

## Accessibility

Semantic landmarks, one `h1` with no skipped levels, a skip link, visible
`:focus-visible` on the brand accent, labelled form fields with `aria-invalid`
and described errors, a focus-trapped modal that restores focus on close and
moves focus into the success panel, and `role="status"` on the confirmation.
Decorative workspace chrome is `aria-hidden` so screen readers aren't read a
fake browser.
