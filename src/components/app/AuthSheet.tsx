"use client";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { useState } from "react";

type AuthSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onLogin: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function AuthSheet({ open, onOpenChange, onRegister, onLogin }: AuthSheetProps) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const result =
      mode === "register"
        ? await onRegister(username, password)
        : await onLogin(username, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setUsername("");
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "register" ? copy.auth.createTitle : copy.auth.loginTitle}
      description={copy.auth.localNote}
    >
      <form
        className="flex flex-col gap-3 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink-soft font-semibold">
            {copy.auth.username}
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="bg-sunk text-ink ring-line min-h-11 rounded-[14px] px-3 text-[15px] outline-none ring-1 focus:ring-ink/30"
            maxLength={24}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink-soft font-semibold">
            {copy.auth.password}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="bg-sunk text-ink ring-line min-h-11 rounded-[14px] px-3 text-[15px] outline-none ring-1 focus:ring-ink/30"
          />
        </label>
        {error ? <p className="text-caption text-wrong font-semibold">{error}</p> : null}
        <Button type="submit" className="mt-1 w-full" disabled={busy}>
          {mode === "register" ? copy.auth.create : copy.auth.login}
        </Button>
        <button
          type="button"
          className="text-small text-ink-soft py-2 font-semibold"
          onClick={() => {
            setMode(mode === "register" ? "login" : "register");
            setError("");
          }}
        >
          {mode === "register" ? copy.auth.haveAccount : copy.auth.needAccount}
        </button>
      </form>
    </Sheet>
  );
}
