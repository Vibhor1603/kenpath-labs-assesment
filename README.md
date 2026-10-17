Ref: KL-7Q4

# Ken — become smarter every day

Ken is a small daily learning web app built for the Kenpath Labs assessment. Each day you open one illustrated discovery (fridge, leaf, or heart), walk through a short guided lesson, then take a 5-question test. Score **at least 4 of 5** to earn Ken points, grow your streak, and add the object to your museum.

The product is tuned for modest Android phones and mobile data: static HTML export, transform/opacity motion only, optional lite/calm modes, CSS + Web Audio celebration (no large media), and first-load size budgets.

## Live link

**https://kenpath-labs.vercel.app**

Open on a phone first. Static export hosted on Vercel free tier.

## Quick start

```bash
git clone <this-repo-url>
cd kenpath-labs-assesment
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Fresh installs ship a **showcase museum** so reviewers can see progress immediately:

| Day | Discovery | State |
| --- | --- | --- |
| A−2 | Refrigerator | Done · fire score 5/5 |
| A−1 | Leaf | Done · fire score 4/5 |
| A (today) | Heart | Ready to start |

To wipe the seed and start empty from day 1:

```text
http://127.0.0.1:3000/?fresh=1
```

To open any lesson without unlock rules (review only):

```text
http://127.0.0.1:3000/?demo=1&view=lesson&d=leaf&step=1
```

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local Next.js app |
| `npm run build` | Static export into `out/` |
| `npm run preview` | Serve `out/` on port 4173 |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Playwright on a low-end Android viewport |
| `npm run budget` | First-load JS / font size budgets |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

### Environment

No API keys are required for the core app. Progress lives in `localStorage` under `kenpath-museum-v1`.

Optional (not required to run):

- `NEXT_PUBLIC_SYNC=off` — keep scoring local (default for this build)

Do **not** commit `.env*` files, local notes, or private docs. Those paths are gitignored.

## What you will see

1. **Home** — today’s discovery, Ken points, streak sprout, museum shelf with fire scores, badges, and preferences (haptics, calm motion, dark mode, Hinglish).
2. **Lesson** — 11 illustrated steps per discovery. Focused parts stay in color; the rest go grayscale. Optional Hinglish copy for the same science in mixed Hindi–English.
3. **Test** — 5 shuffled questions. Pass at **4 of 5**. Perfect (5/5) still earns the Perfect Scholar badge.
4. **Result / reward** — fire marks for the score; on a pass, a short confetti burst + pop sounds (skipped on lite, calm, or reduced-motion devices). Demo reward units only — no real money wording.

## Tech stack

- **Next.js** (App Router, `output: "export"`) + **React 19**
- **Tailwind CSS v4** design tokens (light + dark via `data-theme`)
- **Base UI** for sheets/dialogs
- **Vitest** + **Playwright**
- No payment backend in this demo; Ken points map to demo “reward units” only

## Project map

```text
src/
  app/                 # page shell, CSS, boot script
  art/                 # SVG lesson art (fridge, leaf, heart)
  components/app/      # Home, Lesson, Test, Result, Reward
  components/stage/    # camera, labels, swipe
  content/             # lessons, quiz, copy, Hinglish map
  hooks/               # progress, view, device flags
  lib/                 # scoring, unlock, streak, storage, confetti
tests/
  unit/                # pure rules
  e2e/                 # phone-sized flows
```

### How the main features work

1. **Daily unlock** — `firstVisitDate` + calendar day decide `maxUnlockedDay`. Showcase seeds fridge and leaf so heart is today’s open exhibit. `?demo=1` unlocks all for review.
2. **Lesson** — one route (`/`) with `?view=lesson&d=heart&step=3`. Parts stay mounted; steps only change opacity/camera. Non-focus parts go grayscale.
3. **Test** — 5 questions, shuffled per attempt. **Pass ≥ 4**. Perfect is still 5/5 (badge).
4. **Rewards** — first collect pays base + streak; imperfect attempts pay effort points; revisit pays a small daily bonus. Sheet shows demo reward units.
5. **Low-end** — boot script sets `data-lite` / `data-calm`; confetti and loops skip when needed; fonts and JS are budget-checked (JS ≤ 200 KB gz, fonts ≤ 90 KB).

## AI tools used

Cursor (Composer) was used for scaffolding, the lesson UI, scoring rules, Hinglish copy, dark mode, confetti, and this README. Human review for product rules (4/5 pass, showcase seed, Kenpath wording, no money/cash/earnings copy).

## Explainer (short)

**Built:** a daily museum loop with three discoveries, illustrated lessons (11 steps each), quizzes, points, streak sprout, badges, dark mode, Hinglish, and a demo reward wallet.

**Choices:** static export for cheap hosting; local progress for zero backend; 4/5 pass line so near-misses still feel fair; fire marks for score readability; confetti via CSS + Web Audio (no large media).

**Left out:** real payouts, server scoring, leaderboard, push notifications, and a full CMS for lessons. Those need a backend and careful anti-tamper design before any real reward.

## License

Private assessment submission. All rights reserved by the author unless Kenpath Labs states otherwise.
