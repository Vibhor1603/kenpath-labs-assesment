Ref: KL-7Q4

# Ken — become smarter every day

Daily learning app for the Kenpath Labs assessment. Open one discovery per day (fridge, leaf, heart), walk a short lesson, take a 5-question quiz, need **4 of 5** to collect it, earn **Ken points**, keep a streak, unlock badges, and spend points in a **demo reward shop**.

**Live:** https://kenpath-labs.vercel.app (try on a phone)

---

## What it does

| Feature | Notes |
| --- | --- |
| Daily museum | One unlock per calendar day; locked rows show teasers |
| Lessons | ~11 illustrated steps; optional **Hinglish** |
| Quiz | 5 questions, shuffled; pass at 4/5 |
| Server wallet | Signed-in users: grades + points + coupons live on Supabase |
| Guest play | Lessons/museum work locally; earn/redeem need an account |
| Shop | Demo brand coupons (not real money); codes from the API |
| Streak + badges | Local museum UX; wallet points stay server-side when logged in |
| Dark mode | True black theme |
| Share card | PNG for social; name from account if logged in |
| Low-end care | Lite/calm skips heavy motion; size budgets in CI |

Showcase seed on first open: fridge done, leaf done, heart ready today. Wallet starts at **0** until you sign in and pass a graded test.

| Deep link | Effect |
| --- | --- |
| `?fresh=1` | Wipe local museum seed |
| `?demo=1` | Unlock all lessons (review only) |

---

## Quick start

```bash
git clone <this-repo-url>
cd kenpath-labs-assesment
cp .env.example .env.local   # add Supabase URL + anon key
npm install
npm run dev
```

Open http://127.0.0.1:3000

| Env var | Required |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |

Never commit `.env*` or the `service_role` key.

| Command | Use |
| --- | --- |
| `npm run dev` | Local app + API routes |
| `npm run build` / `npm run preview` | Production build / `next start -p 4173` |
| `npm test` / `npm run e2e` | Unit / Playwright |
| `npm run lint` / `npm run typecheck` / `npm run budget` | Quality gates |

---

## Database setup (Supabase)

1. Create a Supabase project (or use the existing `kenpath-labs` one).
2. In the SQL Editor (or CLI), run the files in order under [`supabase/migrations/`](supabase/migrations/):
   - `20261017120000_server_wallet.sql` — tables, RLS, RPCs, quiz/shop seeds
   - `20261017110000_auto_confirm_email.sql` — auto-confirm so signup does not hit email rate limits
3. Copy **Project URL** + **anon** key into `.env.local` (and Vercel env for deploy).
4. Auth → Providers → Email: you can leave Confirm email on; the auto-confirm trigger still gives an immediate session. Or turn Confirm email off in the dashboard.

**Tables (short why):**

| Table | Role |
| --- | --- |
| `profiles` | Username / display name (not in editable user metadata) |
| `wallets` | Fast balance: earned − spent |
| `wallet_ledger` | Audit trail + idempotency |
| `shop_items` | Catalog and **server** prices |
| `redemptions` | Issued coupon codes |
| `quiz_questions` | Prompts + options |
| `quiz_answer_keys` | Correct answers (no client read policies) |
| `quiz_sessions` | Shuffled paper + hidden correct indices |
| `quiz_attempts` | Graded history for collect / revisit rules |

**RPCs** (authenticated only): `start_quiz`, `submit_quiz`, `redeem_shop_item`, `get_wallet`.

**App APIs** (thin wrappers):

```text
POST /api/quiz/start      { discoveryId }
POST /api/quiz/submit     { sessionId, selectedIndices }   # no client score
POST /api/wallet/redeem   { itemId }
GET  /api/wallet
```

Signed-in points cannot be faked from `localStorage` or a forged score payload. Coupons are demo codes, not real brand vouchers.

---

## Folder map

```text
src/app/              Page shell + API routes
src/app/api/          quiz start/submit, wallet get/redeem
src/components/app/   Screens + sheets (Home, Lesson, Test, Shop, Auth…)
src/components/ui/    Button, Sheet, Switch
src/content/          Lessons, quiz copy, Hinglish, UI strings
src/art/              SVG lesson art (fridge / leaf / heart)
src/hooks/            Progress, auth, view URL, device flags
src/lib/              Scoring, storage, wallet client, Supabase helpers
src/middleware.ts     Refreshes Supabase auth cookies
supabase/migrations/  Postgres schema + seeds
tests/unit|e2e/       Vitest + Playwright
```

---

## Tech

Next.js 16 App Router (Node on Vercel, not static export) · React 19 · Tailwind v4 · Supabase Auth + Postgres · Vitest · Playwright

Built for modest Android phones, mobile data, and ESL-friendly Hinglish — with a server wallet so rewards that feel valuable cannot be forged in the browser.

## License

Private assessment submission.
