"use client";

import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";
import type { Progress } from "@/content/types";
import type { ProgressAction } from "@/lib/progress";

type SettingsPopoverProps = {
  progress: Progress;
  dispatch: (action: ProgressAction) => void;
};

/**
 * SettingsPopover: a small settings popover with two switches.
 * Haptics: on/off (behind the switch, feature-detected).
 * Calm motion: on/off (forces reduced motion when on).
 */
export function SettingsPopover({ progress, dispatch }: SettingsPopoverProps) {
  const { haptics, calmMotion } = progress.settings;

  return (
    <Popover>
      <PopoverTrigger>
        <button
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-transform"
          aria-label="Settings"
        >
          <Settings className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[220px] rounded-[16px] border border-border/50 bg-background p-4"
        align="end"
        sideOffset={6}
      >
        <p className="mb-3 text-[13px] font-[600] uppercase tracking-widest text-muted-foreground">
          Settings
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div id="settings-haptics-label">
              <p className="text-[15px] font-medium text-foreground">Haptics</p>
              <p className="text-[12px] text-muted-foreground">Vibration feedback</p>
            </div>
            <Switch
              id="settings-haptics"
              checked={haptics}
              onCheckedChange={(v) =>
                dispatch({ type: "setSetting", key: "haptics", value: v })
              }
              aria-labelledby="settings-haptics-label"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div id="settings-calm-motion-label">
              <p className="text-[15px] font-medium text-foreground">Calm motion</p>
              <p className="text-[12px] text-muted-foreground">Reduce animations</p>
            </div>
            <Switch
              id="settings-calm-motion"
              checked={calmMotion}
              onCheckedChange={(v) =>
                dispatch({ type: "setSetting", key: "calmMotion", value: v })
              }
              aria-labelledby="settings-calm-motion-label"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
