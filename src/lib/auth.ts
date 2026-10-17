import { AUTH_STORAGE_KEY } from "@/lib/tokens";

export type AuthUser = {
  username: string;
  /** Display name shown on share cards. Defaults to username. */
  displayName: string;
  createdAt: string;
};

type StoredAccount = AuthUser & {
  /** Hex salt; set for all new accounts. */
  passwordSalt?: string;
  passwordHash: string;
  /**
   * Legacy unsalted SHA-256 (username:password). Cleared on next successful login
   * after rehashing with a salt.
   */
  legacyHash?: string;
};

type AuthStore = {
  accounts: Record<string, StoredAccount>;
  session: string | null;
};

const ACCOUNTS_KEY = `${AUTH_STORAGE_KEY}-accounts`;
const MIN_PASSWORD = 6;

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

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Secure hashing is not available in this browser.");
  }
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/** Salted hash: SHA-256(salt + ":" + password). */
async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${password}`);
}

/** Legacy scheme used before salts existed. */
async function legacyHashPassword(password: string, usernameKey: string): Promise<string> {
  return sha256Hex(`${usernameKey}:${password}`);
}

/** Constant-time string compare for equal-length hex digests. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function publicUser(account: StoredAccount): AuthUser {
  return {
    username: account.username,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

export function getSessionUser(): AuthUser | null {
  const store = readStore();
  if (!store.session) return null;
  const account = store.accounts[store.session.toLowerCase()];
  if (!account) return null;
  return publicUser(account);
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
  if (password.length < MIN_PASSWORD) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD} characters.`,
    };
  }
  if (password.length > 128) {
    return { ok: false, error: "Password is too long." };
  }

  const store = readStore();
  const key = name.toLowerCase();
  if (store.accounts[key]) {
    return { ok: false, error: "That username is taken on this phone." };
  }

  try {
    const passwordSalt = randomSalt();
    const passwordHash = await hashPassword(password, passwordSalt);
    const user: AuthUser = {
      username: name,
      displayName: name,
      createdAt: new Date().toISOString(),
    };
    store.accounts[key] = { ...user, passwordSalt, passwordHash };
    store.session = key;
    writeStore(store);
    return { ok: true, user };
  } catch {
    return { ok: false, error: "Could not create account on this device." };
  }
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
  if (password.length < 1 || password.length > 128) {
    return { ok: false, error: "Wrong password." };
  }

  try {
    let ok = false;

    if (account.passwordSalt && account.passwordHash) {
      const attempt = await hashPassword(password, account.passwordSalt);
      ok = timingSafeEqual(attempt, account.passwordHash);
    } else if (account.legacyHash || account.passwordHash) {
      // Migrate pre-salt accounts on successful login.
      const legacy = account.legacyHash ?? account.passwordHash;
      const attempt = await legacyHashPassword(password, key);
      ok = timingSafeEqual(attempt, legacy);
      if (ok) {
        const passwordSalt = randomSalt();
        account.passwordSalt = passwordSalt;
        account.passwordHash = await hashPassword(password, passwordSalt);
        delete account.legacyHash;
      }
    }

    if (!ok) {
      return { ok: false, error: "Wrong password." };
    }

    store.session = key;
    writeStore(store);
    return { ok: true, user: publicUser(account) };
  } catch {
    return { ok: false, error: "Could not log in on this device." };
  }
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
  return publicUser(account);
}

/** Test helper: wipe auth store (unit tests only). */
export function __resetAuthStoreForTests(): void {
  try {
    localStorage.removeItem(ACCOUNTS_KEY);
  } catch {
    // ignore
  }
}
