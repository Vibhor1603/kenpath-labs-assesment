"use client";

import { artLoaders } from "@/content/index";
import type { Discovery } from "@/content/types";
import { spring } from "@/lib/motion";
import { m } from "motion/react";
import { Suspense, lazy, useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { ArtComponentProps } from "@/content/types";

type TrophyProps = {
  discovery: Discovery;
  isCollected: boolean;
  catalogNo: string;
};

type ArtType = ComponentType<ArtComponentProps>;

/**
 * Trophy: a simplified trophy version of the art above a museum placard.
 * Tapping a collected trophy gives a small boop (rotate + spring back).
 */
export function Trophy({ discovery, isCollected, catalogNo }: TrophyProps) {
  const [ArtComponent, setArtComponent] = useState<ArtType | null>(null);
  const [booped, setBooped] = useState(false);

  useEffect(() => {
    if (!isCollected) return;
    const loader = artLoaders[discovery.id];
    loader().then((mod) => setArtComponent(() => mod.default as ArtType));
  }, [discovery.id, isCollected]);

  const handleBoop = () => {
    if (!isCollected) return;
    setBooped(true);
    setTimeout(() => setBooped(false), 300);
  };

  if (!isCollected) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Silhouette placeholder */}
        <div className="flex h-[90px] w-[80px] items-center justify-center rounded-[12px] bg-card/50">
          <div className="h-[70px] w-[56px] rounded-[8px] bg-border/30" />
        </div>
        {/* Placard */}
        <Placard catalogNo={catalogNo} name="?" domain="?" locked />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <m.button
        animate={{ rotate: booped ? 4 : 0 }}
        transition={spring.press}
        onClick={handleBoop}
        className="flex items-center justify-center"
        aria-label={`${discovery.shortName} trophy`}
        style={{ touchAction: "manipulation" }}
      >
        {ArtComponent ? (
          <ArtComponent idPrefix={`trophy-${discovery.id}`} variant="trophy" />
        ) : (
          <div className="h-[90px] w-[80px] rounded-[12px] bg-card animate-pulse" />
        )}
      </m.button>

      <Placard
        catalogNo={catalogNo}
        name={discovery.shortName}
        domain={discovery.domain}
      />
    </div>
  );
}

function Placard({
  catalogNo,
  name,
  domain,
  locked = false,
}: {
  catalogNo: string;
  name: string;
  domain: string;
  locked?: boolean;
}) {
  return (
    <div className="w-full rounded-[8px] bg-card px-2 py-1.5 text-center border border-border/30">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground leading-none">
        {catalogNo}
      </p>
      <p className="text-[12px] font-medium text-foreground leading-snug mt-0.5">
        {locked ? "Locked" : name}
      </p>
      {!locked && (
        <p className="text-[10px] text-muted-foreground capitalize">{domain}</p>
      )}
    </div>
  );
}
