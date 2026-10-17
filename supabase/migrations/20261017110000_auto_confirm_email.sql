-- Assessment UX: auto-confirm emails on insert so signup returns a session
-- without waiting on Supabase's built-in SMTP (very low email rate limits).
-- Prefer also turning off "Confirm email" in the Auth dashboard.

create or replace function public.auto_confirm_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $fn$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$fn$;

drop trigger if exists trg_public_auto_confirm on auth.users;
create trigger trg_public_auto_confirm
before insert on auth.users
for each row execute function public.auto_confirm_auth_user();

revoke all on function public.auto_confirm_auth_user() from public, anon, authenticated;
