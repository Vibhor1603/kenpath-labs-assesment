import { describe, expect, it } from "vitest";
import { availableBalance, canRedeem, getShopItem } from "@/lib/rewards";

/**
 * These tests document the trust boundary: UI helpers are display-only.
 * Authoritative costs/balances live in Postgres RPCs (see supabase/migrations).
 */
describe("wallet security boundary", () => {
  it("never treats a forged local balance as enough without server confirm", () => {
    const item = getShopItem("swiggy-50");
    expect(item).toBeTruthy();
    // Client can compute affordability for UX, but redeem MUST hit /api/wallet/redeem.
    expect(canRedeem(item!, 10_000, 0)).toBe(true);
    expect(availableBalance(200, 200)).toBe(0);
    expect(canRedeem(item!, 200, 200)).toBe(false);
  });

  it("catalog costs are positive integers", () => {
    const item = getShopItem("amazon-150");
    expect(item?.cost).toBe(1200);
  });
});
