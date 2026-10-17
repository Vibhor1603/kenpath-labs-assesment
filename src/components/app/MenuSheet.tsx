"use client";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { copy } from "@/content/copy";
import type { AuthUser } from "@/lib/auth";
import type { Progress } from "@/content/types";
import { useState } from "react";

type MenuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Progress;
  user: AuthUser | null;
  onSetting: (key: "darkMode" | "hinglish", value: boolean) => void;
  onLoginPress: () => void;
  onLogout: () => void;
  onRename: (name: string) => void;
};

export function MenuSheet({
  open,
  onOpenChange,
  progress,
  user,
  onSetting,
  onLoginPress,
  onLogout,
  onRename,
}: MenuSheetProps) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={copy.menu.title}>
      <section className="pb-2" aria-labelledby="profile-heading">
        <h3 id="profile-heading" className="text-caption text-ink-soft font-semibold tracking-[0.06em] uppercase">
          {copy.menu.profile}
        </h3>
        {user ? (
          <div className="mt-2 flex items-center gap-3">
            <span
              className="bg-brass text-surface flex size-11 shrink-0 items-center justify-center rounded-full text-[17px] font-bold"
              aria-hidden="true"
            >
              {(user.displayName[0] || "K").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              {editing ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onRename(nameDraft);
                    setEditing(false);
                  }}
                >
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="bg-sunk text-ink ring-line min-h-10 flex-1 rounded-[12px] px-3 text-[15px] outline-none ring-1"
                    maxLength={32}
                  />
                  <Button type="submit" size="md">
                    {copy.menu.save}
                  </Button>
                </form>
              ) : (
                <>
                  <p className="truncate text-[16px] leading-[20px] font-semibold">
                    {user.displayName}
                  </p>
                  <p className="text-caption text-ink-soft">@{user.username}</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-small text-ink-soft mt-2">{copy.menu.guestLine}</p>
        )}
        <div className="mt-3 flex gap-2">
          {user ? (
            <>
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setNameDraft(user.displayName);
                  setEditing(true);
                }}
              >
                {copy.menu.editName}
              </Button>
              <Button variant="secondary" size="md" className="flex-1" onClick={onLogout}>
                {copy.auth.logout}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                onLoginPress();
              }}
            >
              {copy.auth.loginOrCreate}
            </Button>
          )}
        </div>
      </section>

      <div className="border-line my-4 border-t" />

      <section aria-labelledby="settings-heading">
        <h3
          id="settings-heading"
          className="text-caption text-ink-soft font-semibold tracking-[0.06em] uppercase"
        >
          {copy.home.prefsHeading}
        </h3>
        <div className="mt-1">
          <Pref
            id="menu-dark"
            label={copy.home.darkLabel}
            hint={copy.home.darkHint}
            checked={progress.settings.darkMode}
            onChange={(v) => onSetting("darkMode", v)}
          />
          <Pref
            id="menu-hinglish"
            label={copy.home.hinglishLabel}
            hint={copy.home.hinglishHint}
            checked={progress.settings.hinglish}
            onChange={(v) => onSetting("hinglish", v)}
          />
        </div>
      </section>
      <p className="text-caption text-ink-soft mt-4 pb-2 text-center">
        {copy.home.savedLine}
      </p>
    </Sheet>
  );
}

function Pref({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[58px] items-center gap-3 py-1.5">
      <div className="min-w-0 flex-1">
        <p id={`${id}-label`} className="text-[15px] leading-[20px] font-semibold">
          {label}
        </p>
        <p id={`${id}-hint`} className="text-caption text-ink-soft">
          {hint}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}
