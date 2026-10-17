import { createClient } from "@/lib/supabase/browser";

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
};

const MIN_PASSWORD = 6;

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "That email is already registered.";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Wrong email or password.";
  }
  if (m.includes("password")) return "Password must be at least 6 characters.";
  return message || "Something went wrong.";
}

async function loadProfile(userId: string, email: string): Promise<AuthUser> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", userId)
    .maybeSingle();
  return {
    id: userId,
    email,
    username: data?.username ?? email.split("@")[0] ?? "learner",
    displayName: data?.display_name ?? data?.username ?? "learner",
  };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;
  return loadProfile(data.user.id, data.user.email);
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const name = username.trim();
  const mail = email.trim().toLowerCase();
  if (name.length < 2 || name.length > 24) {
    return { ok: false, error: "Username must be 2 to 24 characters." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { ok: false, error: "Use letters, numbers or underscore only." };
  }
  if (!mail.includes("@") || mail.length < 5) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password.length > 128) {
    return { ok: false, error: "Password is too long." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: mail,
    password,
    options: {
      data: { username: name, display_name: name },
    },
  });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  if (!data.user) return { ok: false, error: "Could not create account." };

  // If email confirm is on, session may be null — still treat as registered.
  if (!data.session) {
    return {
      ok: false,
      error: "Check your email to confirm the account, then log in.",
    };
  }

  const user = await loadProfile(data.user.id, mail);
  return { ok: true, user };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const mail = email.trim().toLowerCase();
  if (!mail || password.length < 1) {
    return { ok: false, error: "Enter email and password." };
  }
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: mail,
    password,
  });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  if (!data.user?.email) return { ok: false, error: "Could not log in." };
  const user = await loadProfile(data.user.id, data.user.email);
  return { ok: true, user };
}

export async function logoutUser(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function updateDisplayName(
  displayName: string,
): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) return null;
  const next = displayName.trim().slice(0, 32) || "learner";
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: next })
    .eq("id", auth.user.id);
  if (error) return null;
  return loadProfile(auth.user.id, auth.user.email);
}
