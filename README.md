# How Things Work

A daily illustrated museum in your pocket. Each day you discover one thing, watch it come apart and work, then pass a 5-question test with full marks to earn Kenpath Points and add it to your shelf.

## Live link

Coming after deploy. (Ask before production.)

## Requirements

- Node.js 22+

## Run locally

```bash
git clone <repo-url> kenpath-labs
cd kenpath-labs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Static export preview

```bash
npm run build
npm run preview
```

Opens at [http://localhost:4173](http://localhost:4173).

## Testing

```bash
npm run test
npx playwright install --with-deps
npm run e2e
npm run lhci
npm run verify
```

## Grader tip

- Open `/?demo=1` to unlock all three discoveries for this browser session.
- Open `/?demo=0` to turn demo mode off.
- Reset progress by clearing site data for the origin.

## Optional: Supabase sync

The app works fully offline with localStorage. To enable optional anonymous sync and server-checked scoring, set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

SQL migrations live in `supabase/migrations/`. Run `npm run smoke:sync` after configuring env.

## Folder map

```
src/app/           layout, page, globals
src/components/    app, stage, scene, ui
src/art/           fridge, leaf, heart SVG art
src/content/       discoveries, copy, sources
src/lib/           pure rules, storage, motion tokens
tests/unit/        Vitest
tests/e2e/         Playwright
```

## How to add a new discovery

1. Add `src/content/<id>.ts` with steps and a 5-question quiz.
2. Add `src/art/<id>/<Id>Art.tsx`.
3. Register it in `src/content/index.ts`.
4. Run `npm run test` (content lint tells you what is wrong).

## AI tools used

Cursor agent, design skills (`/emil-design-eng`, `/hallmark`, `/product-design`), Motion AI Kit guidance, and the build brief. Art and rules were reviewed by hand against the product brief.
