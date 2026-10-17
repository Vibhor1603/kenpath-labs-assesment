Ref: KL-7Q4

# Ken — become smarter every day

Ken is a daily learning web app built for the Kenpath Labs assessment. Each day you open one illustrated discovery (fridge, leaf, or heart), walk a short lesson, then take a 5-question test. Score **at least 4 of 5** to collect the exhibit, earn **Ken points** in a **server wallet**, grow a streak, unlock badges, and spend points in a **demo reward shop**.

## Live link

**https://kenpath-labs.vercel.app**

Open on a phone first.

## Security model (read this)

Ken points, quiz grades, shop prices, and coupon codes are **server-authoritative** on Supabase (project `kenpath-labs`).

| Attack | Mitigation |
| --- | --- |
| Edit `localStorage` points | Ignored when signed in — UI syncs from `get_wallet()` |
| POST `{ score: 5 }` to mint points | Rejected — only `selectedIndices` accepted; server grades |
| POST fake `cost` / fake coupon | Ignored — `redeem_shop_item` reads `shop_items.cost` and mints `gen_random_bytes` codes |
| Call wallet RPCs while logged out | RPCs require `authenticated`; anon execute revoked |
| Read answer keys via REST | `quiz_answer_keys` has RLS on and **no** policies |

Museum progress (lessons collected, badges, settings) can still live on-device for UX. **Money cannot.**

Demo coupons are **not** real Swiggy/Amazon vouchers — integrity of the ledger is production-shaped; payout rails are not.

## Quick start

```bash
git clone <this-repo-url>
cd kenpath-labs-assesment
cp .env.example .env.local   # fill Supabase URL + anon key
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon/publishable key (safe for browser; RLS + RPC authz) |

Never commit `.env*` or the `service_role` key. Vercel production/preview/development already have the public vars set for this repo’s deployment.

**Auth:** New accounts are auto-confirmed in Postgres (`trg_public_auto_confirm`) so signup returns a session immediately and does not burn Supabase’s tiny built-in email rate limit. You can also turn **Confirm email** off under Authentication → Providers → Email.

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local Next.js (App Router + API routes) |
| `npm run build` | Production build |
| `npm run preview` | `next start -p 4173` |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright (low-end Android viewport) |
| `npm run budget` | First-load JS / font size budgets |
| `npm run typecheck` / `npm run lint` | CI basics |

Fresh installs still ship a **showcase museum** so reviewers see progress immediately (local UX seed). Server wallet balance starts at **0** until you sign in and pass a graded test.

| Day | Discovery | State |
| --- | --- | --- |
| A−2 | Refrigerator | Done · fire score 5/5 |
| A−1 | Leaf | Done · fire score 4/5 |
| A (today) | Heart | Ready to start |

Wipe local museum seed: `?fresh=1`  
Review unlock bypass: `?demo=1&view=lesson&d=leaf&step=1`

## Server wallet flow

```text
Sign up / log in (Supabase Auth)
    → POST /api/quiz/start   → shuffled paper (no answers)
    → answer questions
    → POST /api/quiz/submit  → server grades + credits ledger
    → POST /api/wallet/redeem → atomic spend + random coupon code
    → GET  /api/wallet       → balance, catalog, redemptions
```

### Database tables (why each exists)

| Table | Why separate |
| --- | --- |
| `profiles` | App username/display name. Not in `user_metadata` (user-editable → unsafe for authz). |
| `wallets` | O(1) balance row with lock on redeem (`earned - spent`). |
| `wallet_ledger` | Append-only audit + idempotency keys (no double-credit). |
| `shop_items` | Server-owned catalog/costs — client price is display-only. |
| `redemptions` | Immutable issued coupons; codes from `gen_random_bytes`. |
| `quiz_questions` | Prompt + options for session build (no answers). |
| `quiz_answer_keys` | Correct option text; RLS locked; only security-definer RPCs read. |
| `quiz_sessions` | Issued shuffled paper + server-only `correct_indices`. |
| `quiz_attempts` | Graded history for first-collect / revisit / streak rules. |

SQL lives in [`supabase/migrations/`](supabase/migrations/).

## What you will see

1. **Home** — today’s discovery, points chip, streak, museum shelf, badges, menu.
2. **Lesson** — illustrated steps; optional Hinglish.
3. **Test** — signed-in users get a **server-graded** shuffled quiz; guests can still practice locally but cannot earn wallet points or redeem.
4. **Result / reward** — fire scores; confetti on pass (skipped on lite/calm/reduced-motion).
5. **Shop** — redeem requires login; codes come from the API.

## Tech stack

- **Next.js 16** App Router (Node hosting on Vercel — **not** static export)
- **Supabase** Auth + Postgres (RLS + security-definer RPCs)
- **React 19**, **Tailwind CSS v4**, **Base UI** sheets
- Vitest + Playwright

## Explainer (assessment)

Kenpath asked for a small learning product that feels good on modest phones. This build keeps lessons light on-device, and moves **anything that can be stolen for value** (points, coupons, grades) to a real backend so DevTools edits and forged payloads do not mint rewards.

## License

Private assessment submission.
