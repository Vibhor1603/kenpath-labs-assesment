"use client";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { copy } from "@/content/copy";
import type { Progress } from "@/content/types";
import {
  availableBalance,
  canRedeem,
  getShopItem,
  SHOP_ITEMS,
  type ShopItem,
} from "@/lib/rewards";
import { cn } from "@/lib/utils";

type ShopSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Progress;
  username: string | null;
  onRedeem: (itemId: string) => void;
  onNeedAuth: () => void;
};

export function ShopSheet({
  open,
  onOpenChange,
  progress,
  username,
  onRedeem,
  onNeedAuth,
}: ShopSheetProps) {
  const balance = availableBalance(progress.points, progress.spentPoints ?? 0);
  const redemptions = progress.redemptions ?? [];

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.shop.title}
      description={copy.shop.subtitle}
    >
      <div className="bg-brass-tint/70 rounded-[18px] px-4 py-3">
        <p className="text-caption text-brass-ink font-semibold tracking-[0.06em] uppercase">
          {copy.shop.balanceLabel}
        </p>
        <p className="tabular font-display text-display text-ink font-semibold">
          {balance}
        </p>
        <p className="text-caption text-ink-soft mt-1">
          {copy.shop.earnedLine(progress.points, progress.spentPoints ?? 0)}
        </p>
      </div>

      <p className="text-caption text-ink-soft mt-4 font-semibold tracking-[0.06em] uppercase">
        {copy.shop.catalogHeading}
      </p>
      <ul className="mt-2 flex flex-col gap-2.5">
        {SHOP_ITEMS.map((item) => (
          <ShopRow
            key={item.id}
            item={item}
            affordable={canRedeem(item, progress.points, progress.spentPoints ?? 0)}
            onRedeem={() => {
              if (!username) {
                onNeedAuth();
                return;
              }
              onRedeem(item.id);
            }}
          />
        ))}
      </ul>

      {redemptions.length > 0 ? (
        <>
          <p className="text-caption text-ink-soft mt-5 font-semibold tracking-[0.06em] uppercase">
            {copy.shop.unlockedHeading}
          </p>
          <ul className="mt-2 mb-3 flex flex-col gap-2">
            {[...redemptions].reverse().map((r) => {
              const item = getShopItem(r.itemId);
              return (
                <li
                  key={r.code}
                  className="ring-line bg-surface rounded-[16px] px-3.5 py-3 ring-1"
                >
                  <p className="text-[14px] font-semibold">
                    {item ? `${item.brand} · ${item.title}` : r.itemId}
                  </p>
                  <p className="tabular text-caption text-ink-soft mt-1 font-semibold">
                    {r.code}
                  </p>
                  <p className="text-caption text-ink-soft mt-0.5">
                    −{r.cost} {copy.reward.pointsLabel}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-small text-ink-soft mt-4 mb-3 pb-1">{copy.shop.emptyUnlocked}</p>
      )}
    </Sheet>
  );
}

function ShopRow({
  item,
  affordable,
  onRedeem,
}: {
  item: ShopItem;
  affordable: boolean;
  onRedeem: () => void;
}) {
  return (
    <li className="ring-line bg-surface flex items-start gap-3 rounded-[16px] px-3.5 py-3 ring-1">
      <div className="min-w-0 flex-1">
        <p className="text-caption text-brass-ink font-semibold tracking-[0.04em] uppercase">
          {item.brand}
        </p>
        <p className="text-[15px] leading-[20px] font-semibold">{item.title}</p>
        <p className="text-caption text-ink-soft mt-0.5">{item.detail}</p>
        <p className="tabular text-caption text-ink mt-1.5 font-semibold">
          {item.cost} {copy.reward.pointsLabel}
        </p>
      </div>
      <Button
        size="md"
        variant={affordable ? "primary" : "secondary"}
        className={cn("shrink-0", !affordable && "opacity-60")}
        disabled={!affordable}
        onClick={onRedeem}
      >
        {affordable ? copy.shop.redeem : copy.shop.needMore}
      </Button>
    </li>
  );
}
