"use client";

import { Exhibit } from "@/components/app/Exhibit";
import { ScoreFires } from "@/components/app/ScoreFires";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { copy } from "@/content/copy";
import type { Discovery } from "@/content/types";
import type { AuthUser } from "@/lib/auth";
import { learntLine, renderShareCardPng, SHARE_SITE } from "@/lib/shareCard";
import { toast } from "@/lib/toast";
import { Download, Share2 } from "lucide-react";
import { useState } from "react";

type ShareAchievementSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discovery: Discovery | null;
  score: number;
  user: AuthUser | null;
  dark: boolean;
  onNeedAuth: () => void;
};

export function ShareAchievementSheet({
  open,
  onOpenChange,
  discovery,
  score,
  user,
  dark,
  onNeedAuth,
}: ShareAchievementSheetProps) {
  const [busy, setBusy] = useState(false);
  if (!discovery) return null;

  const name = user?.displayName ?? copy.share.guestName;
  const line = learntLine(discovery);

  const makeBlob = () =>
    renderShareCardPng({
      displayName: name,
      discovery,
      score,
      dark,
    });

  const download = async () => {
    if (!user) {
      onNeedAuth();
      return;
    }
    setBusy(true);
    try {
      const blob = await makeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ken-${discovery.id}-achievement.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast(copy.share.saved);
    } catch {
      toast(copy.share.failed);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!user) {
      onNeedAuth();
      return;
    }
    setBusy(true);
    try {
      const blob = await makeBlob();
      const file = new File([blob], `ken-${discovery.id}.png`, { type: "image/png" });
      const text = `${line} · ${score}/5 · ${SHARE_SITE}`;
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: copy.share.title });
      } else if (navigator.share) {
        await navigator.share({ text, title: copy.share.title, url: `https://${SHARE_SITE}` });
      } else {
        await download();
        return;
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast(copy.share.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.share.title}
      description={user ? copy.share.hint : copy.share.needAccount}
    >
      <div
        data-domain={discovery.domain}
        className="bg-canvas ring-line overflow-hidden rounded-[20px] ring-1"
      >
        <div className="bg-surface px-4 pt-4 pb-3">
          <p className="font-display text-brass text-[15px] font-semibold">Ken</p>
          <p className="text-caption text-ink-soft">{copy.app.tagline}</p>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="bg-brass text-surface flex size-9 items-center justify-center rounded-full text-[14px] font-bold">
              {(name[0] || "K").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{name}</p>
              <p className="text-caption text-ink-soft">{copy.share.learner}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-4" aria-hidden="true">
          <span className="block h-[88px]">
            <Exhibit
              id={discovery.id}
              idPrefix={`share-${discovery.id}`}
              className="h-full w-auto"
            />
          </span>
        </div>
        <div className="px-4 pb-4">
          <p className="text-[17px] leading-[22px] font-semibold">{line}</p>
          <p className="text-caption text-ink-soft mt-1">{discovery.catalogNo}</p>
          <div className="mt-2 flex items-center gap-2">
            <ScoreFires score={score} size="sm" />
            <span className="text-caption text-ink-soft font-semibold">
              {score} of 5
            </span>
          </div>
          <p className="text-caption text-ink-soft mt-3">{SHARE_SITE}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 pb-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={busy}
          onClick={() => void download()}
        >
          <Download className="size-4" aria-hidden="true" />
          {copy.share.download}
        </Button>
        <Button className="flex-1" disabled={busy} onClick={() => void share()}>
          <Share2 className="size-4" aria-hidden="true" />
          {copy.share.share}
        </Button>
      </div>
    </Sheet>
  );
}
