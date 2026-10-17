-- Ken server wallet
-- =================
-- Why this schema exists (read with README + _vibhor handbook):
-- Client localStorage and request payloads are untrusted. Money, scores, and
-- coupon codes are owned here. The browser may only call RPCs as an
-- authenticated user; it cannot UPDATE wallets or INSERT redemptions directly.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- Why separate from auth.users: app identity (public username / display name)
-- must not live in raw_user_meta_data (user-editable → unsafe for authz).
-- auth.users keeps email/password; this table is the stable app handle.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_len check (char_length(username) between 2 and 24),
  constraint profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$')
);
create unique index profiles_username_lower_uidx on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert/delete for clients — created by trigger on signup only.

-- ---------------------------------------------------------------------------
-- wallets
-- Why a balance row (not only ledger): redeem needs a row lock and O(1)
-- available = earned - spent. Ledger alone would require sum() under contention.
-- Clients: SELECT own row only. Never INSERT/UPDATE from client.
-- ---------------------------------------------------------------------------
create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  points_earned integer not null default 0 check (points_earned >= 0),
  points_spent integer not null default 0 check (points_spent >= 0),
  updated_at timestamptz not null default now(),
  constraint wallets_spent_lte_earned check (points_spent <= points_earned)
);

alter table public.wallets enable row level security;

create policy wallets_select_own
  on public.wallets for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- wallet_ledger
-- Why separate: append-only audit trail. Reconstruct balances, debug disputes,
-- enforce idempotency keys so double-submit cannot double-credit.
-- Clients: SELECT own rows only. Writes only via security definer RPCs.
-- ---------------------------------------------------------------------------
create table public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta_earned integer not null default 0,
  delta_spent integer not null default 0,
  kind text not null check (kind in ('quiz_earn', 'redeem')),
  ref_type text,
  ref_id uuid,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint wallet_ledger_idempotent unique (idempotency_key)
);

create index wallet_ledger_user_created_idx
  on public.wallet_ledger (user_id, created_at desc);

alter table public.wallet_ledger enable row level security;

create policy wallet_ledger_select_own
  on public.wallet_ledger for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- shop_items
-- Why a table (not only client constants): redeem MUST use server cost.
-- Client can lie about price in the UI; RPC ignores payload cost.
-- ---------------------------------------------------------------------------
create table public.shop_items (
  id text primary key,
  brand text not null,
  title text not null,
  detail text not null,
  cost integer not null check (cost > 0),
  code_prefix text not null,
  active boolean not null default true
);

alter table public.shop_items enable row level security;

create policy shop_items_select_active
  on public.shop_items for select to authenticated
  using (active = true);

-- ---------------------------------------------------------------------------
-- redemptions
-- Why separate: issued coupons are immutable facts. Codes generated with
-- gen_random_bytes — never deterministic from username (forgeable).
-- ---------------------------------------------------------------------------
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.shop_items (id),
  cost integer not null check (cost > 0),
  code text not null unique,
  created_at timestamptz not null default now()
);

create index redemptions_user_created_idx
  on public.redemptions (user_id, created_at desc);

alter table public.redemptions enable row level security;

create policy redemptions_select_own
  on public.redemptions for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- quiz_questions + quiz_answer_keys
-- Why split: questions (prompt + options) are needed to build a session;
-- correct answers must NEVER be selectable by the client role.
-- answer_keys: revoke all from authenticated/anon; only security definer reads.
-- ---------------------------------------------------------------------------
create table public.quiz_questions (
  discovery_id text not null check (discovery_id in ('fridge', 'leaf', 'heart')),
  question_id text primary key,
  prompt text not null,
  options text[] not null check (cardinality(options) = 4),
  sort_order smallint not null,
  unique (discovery_id, sort_order)
);

alter table public.quiz_questions enable row level security;
-- No policies → no direct client access. RPCs use security definer.

create table public.quiz_answer_keys (
  question_id text primary key references public.quiz_questions (question_id) on delete cascade,
  correct_option text not null
);

alter table public.quiz_answer_keys enable row level security;
-- No policies → locked down.

-- ---------------------------------------------------------------------------
-- quiz_sessions
-- Why: client must not submit a raw score. Server issues a shuffled paper,
-- stores correct_indices server-side, client only returns selected indices
-- for that session id. Forged {score:5} payloads are rejected.
-- ---------------------------------------------------------------------------
create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  discovery_id text not null check (discovery_id in ('fridge', 'leaf', 'heart')),
  questions_public jsonb not null,
  correct_indices integer[] not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index quiz_sessions_user_idx on public.quiz_sessions (user_id, created_at desc);

alter table public.quiz_sessions enable row level security;
-- No direct select of correct_indices. Exposed only via start_quiz return
-- (public questions) and submit_quiz (internal).

-- ---------------------------------------------------------------------------
-- quiz_attempts
-- Why: durable graded history for streak / first-collect / revisit rules.
-- Server recomputes points from this history — client streak fields are UI only.
-- ---------------------------------------------------------------------------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null unique references public.quiz_sessions (id),
  discovery_id text not null,
  score integer not null check (score between 0 and 5),
  points_awarded integer not null check (points_awarded >= 0),
  selected_indices integer[] not null,
  is_first_collect boolean not null default false,
  is_revisit_bonus boolean not null default false,
  created_at timestamptz not null default now(),
  day_key date not null default ((timezone('utc', now()))::date)
);

create index quiz_attempts_user_discovery_idx
  on public.quiz_attempts (user_id, discovery_id, created_at desc);

-- At most one first-collect credit per discovery per user
create unique index quiz_attempts_first_collect_uidx
  on public.quiz_attempts (user_id, discovery_id)
  where is_first_collect;

-- At most one revisit bonus per discovery per UTC day
create unique index quiz_attempts_revisit_day_uidx
  on public.quiz_attempts (user_id, discovery_id, day_key)
  where is_revisit_bonus;

alter table public.quiz_attempts enable row level security;

create policy quiz_attempts_select_own
  on public.quiz_attempts for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Signup bootstrap: profile + empty wallet
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  dname text;
begin
  uname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(new.email, '@', 1)
  );
  uname := regexp_replace(uname, '[^a-zA-Z0-9_]', '', 'g');
  if char_length(uname) < 2 then
    uname := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  uname := left(uname, 24);
  dname := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), uname);

  insert into public.profiles (id, username, display_name)
  values (new.id, uname, left(dname, 32));

  insert into public.wallets (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public._shuffle_options(opts text[], correct text)
returns table (shuffled text[], correct_index integer)
language plpgsql
as $$
declare
  i int;
  j int;
  tmp text;
  arr text[];
  idx int := -1;
begin
  arr := opts;
  for i in reverse cardinality(arr)..2 loop
    j := 1 + floor(random() * i)::int;
    tmp := arr[i];
    arr[i] := arr[j];
    arr[j] := tmp;
  end loop;
  for i in 1..cardinality(arr) loop
    if arr[i] = correct then
      idx := i - 1; -- 0-based for clients
      exit;
    end if;
  end loop;
  if idx < 0 then
    raise exception 'correct option missing from options';
  end if;
  return query select arr, idx;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: start_quiz — issues shuffled paper; never returns correct_indices
-- ---------------------------------------------------------------------------
create or replace function public.start_quiz(p_discovery_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q record;
  pub jsonb := '[]'::jsonb;
  corrects integer[] := '{}';
  sh text[];
  cidx integer;
  sid uuid;
  item jsonb;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_discovery_id not in ('fridge', 'leaf', 'heart') then
    raise exception 'invalid discovery';
  end if;

  for q in
    select qq.question_id, qq.prompt, qq.options, ak.correct_option
    from public.quiz_questions qq
    join public.quiz_answer_keys ak on ak.question_id = qq.question_id
    where qq.discovery_id = p_discovery_id
    order by qq.sort_order
  loop
    select s.shuffled, s.correct_index into sh, cidx
    from public._shuffle_options(q.options, q.correct_option) s;

    corrects := array_append(corrects, cidx);
    item := jsonb_build_object(
      'id', q.question_id,
      'q', q.prompt,
      'options', to_jsonb(sh)
    );
    pub := pub || jsonb_build_array(item);
  end loop;

  if jsonb_array_length(pub) <> 5 then
    raise exception 'quiz not configured';
  end if;

  sid := gen_random_uuid();
  insert into public.quiz_sessions (
    id, user_id, discovery_id, questions_public, correct_indices, expires_at
  ) values (
    sid, uid, p_discovery_id, pub, corrects, now() + interval '2 hours'
  );

  return jsonb_build_object(
    'sessionId', sid,
    'discoveryId', p_discovery_id,
    'questions', pub,
    'expiresAt', (now() + interval '2 hours')
  );
end;
$$;

revoke all on function public.start_quiz(text) from public;
grant execute on function public.start_quiz(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: submit_quiz — grades server-side; credits wallet; ignores client score
-- ---------------------------------------------------------------------------
create or replace function public.submit_quiz(
  p_session_id uuid,
  p_selected_indices integer[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sess public.quiz_sessions%rowtype;
  score int := 0;
  i int;
  points int := 0;
  first_collect boolean := false;
  revisit boolean := false;
  had_collect boolean;
  attempt_id uuid;
  streak_count int;
  last_day date;
  today date := (timezone('utc', now()))::date;
  earned int;
  spent int;
  avail int;
  idem text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into sess from public.quiz_sessions
  where id = p_session_id and user_id = uid
  for update;

  if not found then
    raise exception 'session not found';
  end if;
  if sess.consumed_at is not null then
    raise exception 'session already used';
  end if;
  if sess.expires_at < now() then
    raise exception 'session expired';
  end if;
  if cardinality(p_selected_indices) <> cardinality(sess.correct_indices) then
    raise exception 'bad answer length';
  end if;

  for i in 1..cardinality(sess.correct_indices) loop
    if p_selected_indices[i] = sess.correct_indices[i] then
      score := score + 1;
    end if;
  end loop;

  select exists(
    select 1 from public.quiz_attempts
    where user_id = uid and discovery_id = sess.discovery_id and is_first_collect
  ) into had_collect;

  -- Streak: consecutive UTC days with a passing attempt (score >= 4)
  select max(day_key) into last_day
  from public.quiz_attempts
  where user_id = uid and score >= 4;

  if score >= 4 then
    if last_day is null then
      streak_count := 1;
    elsif last_day = today then
      select greatest(1, (
        select count(distinct day_key) from (
          select day_key from public.quiz_attempts
          where user_id = uid and score >= 4
          order by day_key desc
          limit 30
        ) d
      )) into streak_count;
      -- same-day pass: keep prior streak length (approx via distinct recent days)
      streak_count := greatest(1, coalesce(streak_count, 1));
    elsif last_day = today - 1 then
      select 1 + count(distinct day_key) into streak_count
      from public.quiz_attempts
      where user_id = uid and score >= 4 and day_key >= today - 30;
    else
      streak_count := 1;
    end if;

    if not had_collect then
      first_collect := true;
      points := 200 + least(50 * streak_count, 200);
    else
      -- revisit bonus once per day if already collected
      if not exists (
        select 1 from public.quiz_attempts
        where user_id = uid and discovery_id = sess.discovery_id
          and is_revisit_bonus and day_key = today
      ) then
        revisit := true;
        points := 75;
      end if;
    end if;
  else
    points := score * 15; -- effort
  end if;

  attempt_id := gen_random_uuid();
  idem := 'quiz:' || p_session_id::text;

  update public.quiz_sessions set consumed_at = now() where id = p_session_id;

  insert into public.quiz_attempts (
    id, user_id, session_id, discovery_id, score, points_awarded,
    selected_indices, is_first_collect, is_revisit_bonus, day_key
  ) values (
    attempt_id, uid, p_session_id, sess.discovery_id, score, points,
    p_selected_indices, first_collect, revisit, today
  );

  if points > 0 then
    update public.wallets
    set points_earned = points_earned + points,
        updated_at = now()
    where user_id = uid;

    insert into public.wallet_ledger (
      user_id, delta_earned, delta_spent, kind, ref_type, ref_id, idempotency_key
    ) values (
      uid, points, 0, 'quiz_earn', 'quiz_attempt', attempt_id, idem
    );
  end if;

  select points_earned, points_spent into earned, spent
  from public.wallets where user_id = uid;
  avail := earned - spent;

  return jsonb_build_object(
    'score', score,
    'pointsAwarded', points,
    'isFirstCollect', first_collect,
    'isRevisitBonus', revisit,
    'wallet', jsonb_build_object(
      'pointsEarned', earned,
      'pointsSpent', spent,
      'available', avail
    )
  );
end;
$$;

revoke all on function public.submit_quiz(uuid, integer[]) from public;
grant execute on function public.submit_quiz(uuid, integer[]) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: redeem_shop_item — server cost + random code; no client price/code
-- ---------------------------------------------------------------------------
create or replace function public.redeem_shop_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  item public.shop_items%rowtype;
  earned int;
  spent int;
  avail int;
  rid uuid;
  code text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into item from public.shop_items where id = p_item_id and active for share;
  if not found then
    raise exception 'item not found';
  end if;

  select points_earned, points_spent into earned, spent
  from public.wallets where user_id = uid for update;

  avail := earned - spent;
  if avail < item.cost then
    raise exception 'insufficient points';
  end if;

  rid := gen_random_uuid();
  code := item.code_prefix || '-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10));

  update public.wallets
  set points_spent = points_spent + item.cost,
      updated_at = now()
  where user_id = uid;

  insert into public.wallet_ledger (
    user_id, delta_earned, delta_spent, kind, ref_type, ref_id, idempotency_key
  ) values (
    uid, 0, item.cost, 'redeem', 'redemption', rid, 'redeem:' || rid::text
  );

  insert into public.redemptions (id, user_id, item_id, cost, code)
  values (rid, uid, item.id, item.cost, code);

  select points_earned, points_spent into earned, spent
  from public.wallets where user_id = uid;

  return jsonb_build_object(
    'redemption', jsonb_build_object(
      'id', rid,
      'itemId', item.id,
      'cost', item.cost,
      'code', code,
      'createdAt', now()
    ),
    'wallet', jsonb_build_object(
      'pointsEarned', earned,
      'pointsSpent', spent,
      'available', earned - spent
    )
  );
end;
$$;

revoke all on function public.redeem_shop_item(text) from public;
grant execute on function public.redeem_shop_item(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: get_wallet
-- ---------------------------------------------------------------------------
create or replace function public.get_wallet()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  earned int;
  spent int;
  redeems jsonb;
  catalog jsonb;
  prof jsonb;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select points_earned, points_spent into earned, spent
  from public.wallets where user_id = uid;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id,
    'itemId', r.item_id,
    'cost', r.cost,
    'code', r.code,
    'createdAt', r.created_at
  ) order by r.created_at desc), '[]'::jsonb)
  into redeems
  from public.redemptions r
  where r.user_id = uid;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'brand', s.brand,
    'title', s.title,
    'detail', s.detail,
    'cost', s.cost
  ) order by s.cost), '[]'::jsonb)
  into catalog
  from public.shop_items s
  where s.active;

  select jsonb_build_object(
    'username', p.username,
    'displayName', p.display_name
  ) into prof
  from public.profiles p where p.id = uid;

  return jsonb_build_object(
    'profile', prof,
    'wallet', jsonb_build_object(
      'pointsEarned', coalesce(earned, 0),
      'pointsSpent', coalesce(spent, 0),
      'available', coalesce(earned, 0) - coalesce(spent, 0)
    ),
    'redemptions', redeems,
    'catalog', catalog
  );
end;
$$;

revoke all on function public.get_wallet() from public;
grant execute on function public.get_wallet() to authenticated;

-- ---------------------------------------------------------------------------
-- Seeds
-- ---------------------------------------------------------------------------
insert into public.shop_items (id, brand, title, detail, cost, code_prefix) values
  ('swiggy-50', 'Swiggy', '₹50 food voucher', 'Demo wallet voucher — not a real Swiggy coupon.', 200, 'KEN-SWIGGY'),
  ('bookmyshow-1', 'BookMyShow', '₹75 movie credit', 'Demo wallet voucher — not a real BookMyShow coupon.', 350, 'KEN-BMS'),
  ('dominos-80', 'Domino''s', '₹80 pizza coupon', 'Demo wallet voucher — not a real Domino''s coupon.', 500, 'KEN-DOMINOS'),
  ('myntra-100', 'Myntra', '₹100 style credit', 'Demo wallet voucher — not a real Myntra coupon.', 800, 'KEN-MYNTRA'),
  ('amazon-150', 'Amazon', '₹150 gift coupon', 'Demo wallet voucher — not a real Amazon coupon.', 1200, 'KEN-AMZN');

-- Fridge
insert into public.quiz_questions (discovery_id, question_id, prompt, options, sort_order) values
('fridge','fridge-q1','What does a fridge really do?', array['Moves heat from inside to outside','Makes new cold air','Destroys heat','Stores cold in the door'],1),
('fridge','fridge-q2','Why are the coils on a fridge warm?', array['They release heat taken from inside','The motor is broken','They heat the food','They hold hot water'],2),
('fridge','fridge-q3','What does the compressor do?', array['Squeezes the gas so it gets hot','Freezes the gas','Cleans the air','Turns gas into ice'],3),
('fridge','fridge-q4','What happens when the liquid passes the narrow tube?', array['Its pressure drops and it gets very cold','It gets hotter','It stops moving','It turns into ice cubes'],4),
('fridge','fridge-q5','Why should you close the fridge door quickly?', array['Warm air gets in, so the fridge must move more heat','The light will break','The refrigerant will leak','The food gets heavier'],5);

insert into public.quiz_answer_keys (question_id, correct_option) values
('fridge-q1','Moves heat from inside to outside'),
('fridge-q2','They release heat taken from inside'),
('fridge-q3','Squeezes the gas so it gets hot'),
('fridge-q4','Its pressure drops and it gets very cold'),
('fridge-q5','Warm air gets in, so the fridge must move more heat');

-- Leaf
insert into public.quiz_questions (discovery_id, question_id, prompt, options, sort_order) values
('leaf','leaf-q1','What does a leaf use to make food?', array['Light, water and carbon dioxide','Soil and sugar','Oxygen and salt','Only water'],1),
('leaf','leaf-q2','How does carbon dioxide get into a leaf?', array['Through tiny pores called stomata','Through the roots','It is made inside the leaf','Through the flowers'],2),
('leaf','leaf-q3','Where in the leaf is the food made?', array['In chloroplasts inside the cells','In the stem','In the pores','In the soil'],3),
('leaf','leaf-q4','What does a leaf let out into the air?', array['Oxygen','Sugar','Soil','Salt'],4),
('leaf','leaf-q5','Why does a leaf need sunlight?', array['Light gives the energy to make sugar','To keep the leaf dry','To melt its wax','To make roots grow in the dark'],5);

insert into public.quiz_answer_keys (question_id, correct_option) values
('leaf-q1','Light, water and carbon dioxide'),
('leaf-q2','Through tiny pores called stomata'),
('leaf-q3','In chloroplasts inside the cells'),
('leaf-q4','Oxygen'),
('leaf-q5','Light gives the energy to make sugar');

-- Heart
insert into public.quiz_questions (discovery_id, question_id, prompt, options, sort_order) values
('heart','heart-q1','What is your heart?', array['A muscle that pumps blood','A bone','A bag of air','A kind of lung'],1),
('heart','heart-q2','How many rooms does the heart have?', array['Four','Two','Three','Six'],2),
('heart','heart-q3','What do heart valves do?', array['Stop blood from flowing back','Add oxygen to blood','Make blood red','Store blood for later'],3),
('heart','heart-q4','Where does the right side of the heart send blood?', array['To the lungs','To the brain only','To the stomach','To the left arm only'],4),
('heart','heart-q5','What makes the lub-dub sound?', array['Valves closing','Blood boiling','Lungs breathing','Bones moving'],5);

insert into public.quiz_answer_keys (question_id, correct_option) values
('heart-q1','A muscle that pumps blood'),
('heart-q2','Four'),
('heart-q3','Stop blood from flowing back'),
('heart-q4','To the lungs'),
('heart-q5','Valves closing');
