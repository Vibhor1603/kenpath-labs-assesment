import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAuthStoreForTests,
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  timingSafeEqual,
  updateDisplayName,
} from "@/lib/auth";

describe("auth (local)", () => {
  beforeEach(() => {
    __resetAuthStoreForTests();
  });

  it("compares digests in constant-ish time", () => {
    expect(timingSafeEqual("abcd", "abcd")).toBe(true);
    expect(timingSafeEqual("abcd", "abce")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });

  it("registers, keeps a session, and rejects short passwords", async () => {
    const bad = await registerUser("ken", "123");
    expect(bad.ok).toBe(false);

    const good = await registerUser("KenLearner", "secret1");
    expect(good.ok).toBe(true);
    if (!good.ok) return;
    expect(good.user.username).toBe("KenLearner");
    expect(getSessionUser()?.username).toBe("KenLearner");
  });

  it("rejects duplicate usernames case-insensitively", async () => {
    await registerUser("vibhor", "secret1");
    logoutUser();
    const again = await registerUser("Vibhor", "secret2");
    expect(again.ok).toBe(false);
  });

  it("logs in with the right password and fails with the wrong one", async () => {
    await registerUser("player1", "correct1");
    logoutUser();
    expect(getSessionUser()).toBeNull();

    const wrong = await loginUser("player1", "nope123");
    expect(wrong.ok).toBe(false);
    expect(getSessionUser()).toBeNull();

    const right = await loginUser("player1", "correct1");
    expect(right.ok).toBe(true);
    expect(getSessionUser()?.username).toBe("player1");
  });

  it("stores a salt + hash, never the raw password", async () => {
    await registerUser("salty", "correct1");
    const raw = localStorage.getItem("kenpath-auth-accounts");
    expect(raw).toBeTruthy();
    const store = JSON.parse(raw!) as {
      accounts: Record<
        string,
        { passwordSalt?: string; passwordHash: string; username: string }
      >;
    };
    const account = store.accounts.salty;
    expect(account.passwordSalt).toMatch(/^[0-9a-f]{32}$/);
    expect(account.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(raw).not.toContain("correct1");
  });

  it("migrates legacy unsalted hashes on login", async () => {
    const key = "legacy";
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${key}:oldpass1`),
    );
    const legacyHash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem(
      "kenpath-auth-accounts",
      JSON.stringify({
        accounts: {
          [key]: {
            username: "Legacy",
            displayName: "Legacy",
            createdAt: new Date().toISOString(),
            passwordHash: legacyHash,
          },
        },
        session: null,
      }),
    );

    const bad = await loginUser("Legacy", "wrong99");
    expect(bad.ok).toBe(false);

    const ok = await loginUser("Legacy", "oldpass1");
    expect(ok.ok).toBe(true);

    const raw = JSON.parse(localStorage.getItem("kenpath-auth-accounts")!) as {
      accounts: Record<string, { passwordSalt?: string; passwordHash: string }>;
    };
    expect(raw.accounts.legacy.passwordSalt).toMatch(/^[0-9a-f]{32}$/);
    expect(raw.accounts.legacy.passwordHash).not.toBe(legacyHash);

    logoutUser();
    const again = await loginUser("Legacy", "oldpass1");
    expect(again.ok).toBe(true);
  });

  it("updates display name for the active session", async () => {
    await registerUser("namer", "secret1");
    const next = updateDisplayName("Namer Singh");
    expect(next?.displayName).toBe("Namer Singh");
    expect(getSessionUser()?.displayName).toBe("Namer Singh");
  });
});
