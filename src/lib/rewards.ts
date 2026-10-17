/**
 * Ken points → demo shop. Coupons are local-only demo unlocks (no real payout).
 */

export type ShopItem = {
  id: string;
  brand: string;
  title: string;
  detail: string;
  cost: number;
  /** Shown after redeem, e.g. coupon code. */
  codePrefix: string;
};

export const SHOP_ITEMS: readonly ShopItem[] = [
  {
    id: "swiggy-50",
    brand: "Swiggy",
    title: "₹50 food voucher",
    detail: "Use on your next Swiggy order from this demo wallet.",
    cost: 200,
    codePrefix: "KEN-SWIGGY",
  },
  {
    id: "bookmyshow-1",
    brand: "BookMyShow",
    title: "₹75 movie credit",
    detail: "One-time demo credit for a ticket booking.",
    cost: 350,
    codePrefix: "KEN-BMS",
  },
  {
    id: "dominos-80",
    brand: "Domino's",
    title: "₹80 pizza coupon",
    detail: "Demo Domino's coupon once you hit 500 Ken points.",
    cost: 500,
    codePrefix: "KEN-DOMINOS",
  },
  {
    id: "myntra-100",
    brand: "Myntra",
    title: "₹100 style credit",
    detail: "Demo shopping credit when you save up 800 points.",
    cost: 800,
    codePrefix: "KEN-MYNTRA",
  },
  {
    id: "amazon-150",
    brand: "Amazon",
    title: "₹150 gift coupon",
    detail: "Bigger demo reward for a strong Ken streak.",
    cost: 1200,
    codePrefix: "KEN-AMZN",
  },
] as const;

export type Redemption = {
  itemId: string;
  cost: number;
  code: string;
  redeemedAt: string;
};

export function availableBalance(points: number, spentPoints: number): number {
  return Math.max(0, Math.floor(points) - Math.max(0, Math.floor(spentPoints)));
}

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function canRedeem(
  item: ShopItem,
  points: number,
  spentPoints: number,
): boolean {
  return availableBalance(points, spentPoints) >= item.cost;
}

/** Deterministic demo code from username + item + count. */
export function makeCouponCode(
  prefix: string,
  username: string,
  redemptionIndex: number,
): string {
  const tag = (username || "guest")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const n = String(redemptionIndex + 1).padStart(2, "0");
  return `${prefix}-${tag}${n}`;
}

/** @deprecated kept for older wallet copy; shop uses raw Ken points now. */
export const POINTS_PER_REWARD_UNIT = 10;

export function demoRewardUnits(points: number): number {
  return Math.floor(Math.max(0, points) / POINTS_PER_REWARD_UNIT);
}
