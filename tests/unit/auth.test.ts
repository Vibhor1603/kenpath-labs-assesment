import { describe, expect, it } from "vitest";

/** Mirrors client-side validation in src/lib/auth.ts (server rejects the rest). */
function validateRegister(username: string, email: string, password: string) {
  const name = username.trim();
  const mail = email.trim().toLowerCase();
  if (name.length < 2 || name.length > 24) {
    return { ok: false as const, error: "Username must be 2 to 24 characters." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { ok: false as const, error: "Use letters, numbers or underscore only." };
  }
  if (!mail.includes("@") || mail.length < 5) {
    return { ok: false as const, error: "Enter a valid email." };
  }
  if (password.length < 6) {
    return { ok: false as const, error: "Password must be at least 6 characters." };
  }
  return { ok: true as const };
}

describe("auth validation (supabase-backed accounts)", () => {
  it("rejects short passwords and bad usernames", () => {
    expect(validateRegister("ken", "a@b.co", "123").ok).toBe(false);
    expect(validateRegister("k", "a@b.co", "secret1").ok).toBe(false);
    expect(validateRegister("bad name", "a@b.co", "secret1").ok).toBe(false);
    expect(validateRegister("ok_user", "not-an-email", "secret1").ok).toBe(false);
  });

  it("accepts a valid register payload shape", () => {
    expect(validateRegister("KenLearner", "ken@example.com", "secret1").ok).toBe(
      true,
    );
  });
});
