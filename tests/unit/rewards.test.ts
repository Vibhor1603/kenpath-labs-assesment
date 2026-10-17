import { describe, expect, it } from "vitest";
import {
  availableBalance,
  canRedeem,
  demoRewardUnits,
  getShopItem,
  makeCouponCode,
  POINTS_PER_REWARD_UNIT,
  SHOP_ITEMS,
} from "@/lib/rewards";

describe("reward shop", () => {
  it("exposes brand coupons with costs", () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(3);
    expect(getShopItem("dominos-80")?.cost).toBe(500);
    expect(getShopItem("swiggy-50")?.cost).toBe(200);
  });

  it("tracks spendable balance from earned minus spent", () => {
    expect(availableBalance(550, 0)).toBe(550);
    expect(availableBalance(550, 200)).toBe(350);
    expect(availableBalance(100, 200)).toBe(0);
  });

  it("gates redeem on balance", () => {
    const pizza = getShopItem("dominos-80")!;
    expect(canRedeem(pizza, 499, 0)).toBe(false);
    expect(canRedeem(pizza, 500, 0)).toBe(true);
    expect(canRedeem(pizza, 700, 250)).toBe(false);
  });

  it("builds demo coupon codes", () => {
    expect(makeCouponCode("KEN-DOMINOS", "vibhor", 0)).toMatch(/^KEN-DOMINOS-/);
  });

  it("still maps legacy reward units", () => {
    expect(POINTS_PER_REWARD_UNIT).toBe(10);
    expect(demoRewardUnits(250)).toBe(25);
  });
});
