import { AUTH_STORAGE_KEY } from "@/lib/tokens";

export type AuthUser = {
  username: string;
  /** Display name shown on share cards. Defaults to username. */
  displayName: string;
  createdAt: string;
};

type StoredAccount = AuthUser & { passwordHash: string };

type AuthStore = {
  accounts: Record<string, StoredAccount>;
  session: string | null;
};

const ACCOUNTS_KEY = `${AUTH_STORAGE_KEY}-accounts`;

function emptyStore(): AuthStore {
  return { accounts: {}, session: null };
}

function readStore(): AuthStore {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AuthStore;
    if (!parsed || typeof parsed !== "object") return emptyStore();
    return {
      accounts: parsed.accounts ?? {},
      session: typeof parsed.session === "string" ? parsed.session : null,
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: AuthStore): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store));
  } catch {
    // private mode
  }
}

async function hashPassword(password: string, username: string): Promise<string> {
  const input = `${username.toLowerCase()}:${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for rare environments without subtle crypto.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv_${(h >>> 0).toString(16)}`;
}

export function getSessionUser(): AuthUser | null {
  const store = readStore();
  if (!store.session) return null;
  const account = store.accounts[store.session.toLowerCase()];
  if (!account) return null;
  return {
    username: account.username,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

export async function registerUser(
  username: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const name = username.trim();
  if (name.length < 2 || name.length > 24) {
    return { ok: false, error: "Username must be 2 to 24 characters." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { ok: false, error: "Use letters, numbers or underscore only." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  const store = readStore();
  const key = name.toLowerCase();
  if (store.accounts[key]) {
    return { ok: false, error: "That username is taken on this phone." };
  }
  const passwordHash = await hashPassword(password, key);
  const user: AuthUser = {
    username: name,
    displayName: name,
    createdAt: new Date().toISOString(),
  };
  store.accounts[key] = { ...user, passwordHash };
  store.session = key;
  writeStore(store);
  return { ok: true, user };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const store = readStore();
  const key = username.trim().toLowerCase();
  const account = store.accounts[key];
  if (!account) {
    return { ok: false, error: "No account with that username on this phone." };
  }
  const passwordHash = await hashPassword(password, key);
  if (passwordHash !== account.passwordHash) {
    return { ok: false, error: "Wrong password." };
  }
  store.session = key;
  writeStore(store);
  return {
    ok: true,
    user: {
      username: account.username,
      displayName: account.displayName,
      createdAt: account.createdAt,
    },
  };
}

export function logoutUser(): void {
  const store = readStore();
  store.session = null;
  writeStore(store);
}

export function updateDisplayName(displayName: string): AuthUser | null {
  const store = readStore();
  if (!store.session) return null;
  const account = store.accounts[store.session];
  if (!account) return null;
  const next = displayName.trim().slice(0, 32) || account.username;
  account.displayName = next;
  writeStore(store);
  return {
    username: account.username,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}
